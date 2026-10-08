-- ==========================================================
-- FIXES & REALTIME  (safe to re-run; run in Supabase SQL Editor
-- AFTER supabase-schema.sql)
-- ==========================================================

-- 0. Make sure the admin-check helper exists (also created by supabase-schema.sql)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 1. REALTIME: let the admin portal receive live changes made by students
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['profiles', 'books', 'borrow_records'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

-- 2. SECURITY: nobody can sign themselves up as admin via signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, roll_number, department, year, phone, role, photo_url, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student User'),
    NEW.raw_user_meta_data->>'roll_number',
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'year',
    NEW.raw_user_meta_data->>'phone',
    'student',
    NEW.raw_user_meta_data->>'photo_url',
    TRUE
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    roll_number = COALESCE(EXCLUDED.roll_number, profiles.roll_number),
    department = COALESCE(EXCLUDED.department, profiles.department),
    year = COALESCE(EXCLUDED.year, profiles.year),
    phone = COALESCE(EXCLUDED.phone, profiles.phone);
  RETURN NEW;
END;
$$;

-- 3. SECURITY: students could previously UPDATE their own role / is_active.
--    Only admins (or the SQL editor / service role, where auth.uid() is null) may change them.
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    NEW.role := OLD.role;
    NEW.is_active := OLD.is_active;
    NEW.roll_number := OLD.roll_number;
    NEW.created_at := OLD.created_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_fields_trg ON public.profiles;
CREATE TRIGGER protect_profile_fields_trg
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.protect_profile_fields();

-- 4. PRIVACY: students could read every other student's phone number etc.
DROP POLICY IF EXISTS "Anyone authenticated can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

-- 5. DATA SAFETY: deleting a book used to silently delete all its loan history.
ALTER TABLE public.borrow_records DROP CONSTRAINT IF EXISTS borrow_records_book_id_fkey;
ALTER TABLE public.borrow_records
  ADD CONSTRAINT borrow_records_book_id_fkey
  FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE RESTRICT;

-- 6. ATOMIC ISSUE / RETURN (no more stale-stock races between two librarians)
CREATE OR REPLACE FUNCTION public.issue_book(p_student_id UUID, p_book_id UUID, p_days INT DEFAULT 14)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_active BOOLEAN;
  v_avail INT;
  v_id UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can issue books.';
  END IF;

  SELECT is_active INTO v_active FROM public.profiles WHERE id = p_student_id AND role = 'student';
  IF v_active IS NULL THEN RAISE EXCEPTION 'Student not found.'; END IF;
  IF NOT v_active THEN RAISE EXCEPTION 'This student account is deactivated. Cannot issue books.'; END IF;

  SELECT available_copies INTO v_avail FROM public.books WHERE id = p_book_id FOR UPDATE;
  IF v_avail IS NULL THEN RAISE EXCEPTION 'Book not found.'; END IF;
  IF v_avail <= 0 THEN RAISE EXCEPTION 'This book is currently out of stock. No copies available to issue.'; END IF;

  INSERT INTO public.borrow_records (student_id, book_id, issue_date, due_date, status, fine_amount, fine_paid)
  VALUES (p_student_id, p_book_id, now(), now() + make_interval(days => LEAST(GREATEST(COALESCE(p_days, 14), 1), 60)), 'issued', 0, FALSE)
  RETURNING id INTO v_id;

  UPDATE public.books SET available_copies = available_copies - 1 WHERE id = p_book_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.return_book(p_record_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.borrow_records%ROWTYPE;
  v_due_end TIMESTAMPTZ;
  v_days INT := 0;
  v_fine NUMERIC := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can process returns.';
  END IF;

  SELECT * INTO r FROM public.borrow_records WHERE id = p_record_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Loan record not found.'; END IF;
  IF r.status = 'returned' THEN RAISE EXCEPTION 'This book has already been returned.'; END IF;

  -- due date counts until end of that day (India time), matching the app's fine rules
  v_due_end := (date_trunc('day', r.due_date AT TIME ZONE 'Asia/Kolkata') + interval '1 day' - interval '1 millisecond')
               AT TIME ZONE 'Asia/Kolkata';
  IF now() > v_due_end THEN
    v_days := CEIL(EXTRACT(EPOCH FROM (now() - v_due_end)) / 86400)::INT;
    v_fine := v_days * 5;
  END IF;

  UPDATE public.borrow_records
  SET return_date = now(), status = 'returned', fine_amount = v_fine, fine_paid = (v_fine = 0)
  WHERE id = p_record_id;

  UPDATE public.books SET available_copies = LEAST(total_copies, available_copies + 1) WHERE id = r.book_id;
  RETURN v_fine;
END;
$$;

REVOKE ALL ON FUNCTION public.issue_book(UUID, UUID, INT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.return_book(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_book(UUID, UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.return_book(UUID) TO authenticated;

-- 7. STORAGE: only admins manage book covers; users only touch their own avatar files
DROP POLICY IF EXISTS "Admins can manage book covers" ON storage.objects;
CREATE POLICY "Admins can manage book covers"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'book-covers' AND public.is_admin())
  WITH CHECK (bucket_id = 'book-covers' AND public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND name LIKE auth.uid()::text || '-%');

DROP POLICY IF EXISTS "Authenticated users can update own avatars" ON storage.objects;
CREATE POLICY "Authenticated users can update own avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND name LIKE auth.uid()::text || '-%');
