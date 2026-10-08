-- ==========================================================
-- COLLEGE LIBRARY MANAGEMENT SYSTEM - DATABASE SCHEMA & RLS
-- Run this entire script in Supabase SQL Editor
-- ==========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT,
    full_name TEXT NOT NULL,
    roll_number TEXT UNIQUE,
    department TEXT,
    year TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    photo_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. BOOKS TABLE
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    total_copies INT NOT NULL DEFAULT 1 CHECK (total_copies >= 0),
    available_copies INT NOT NULL DEFAULT 1 CHECK (available_copies >= 0),
    cover_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. BORROW RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.borrow_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    issue_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    due_date TIMESTAMPTZ NOT NULL,
    return_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'returned', 'overdue')),
    fine_amount NUMERIC NOT NULL DEFAULT 0,
    fine_paid BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. INDEXES FOR HIGH PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_roll ON public.profiles(roll_number);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_books_category ON public.books(category);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON public.books(isbn);
CREATE INDEX IF NOT EXISTS idx_borrow_student ON public.borrow_records(student_id);
CREATE INDEX IF NOT EXISTS idx_borrow_book ON public.borrow_records(book_id);
CREATE INDEX IF NOT EXISTS idx_borrow_status ON public.borrow_records(status);

-- 6. HELPER FUNCTION: Check if user is Admin
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

-- 7. TRIGGER FOR AUTO PROFILE CREATION ON USER SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    roll_number,
    department,
    year,
    phone,
    role,
    photo_url,
    is_active
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student User'),
    NEW.raw_user_meta_data->>'roll_number',
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'year',
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'photo_url',
    TRUE
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, profiles.email),
    full_name = EXCLUDED.full_name,
    roll_number = COALESCE(EXCLUDED.roll_number, profiles.roll_number),
    department = COALESCE(EXCLUDED.department, profiles.department),
    year = COALESCE(EXCLUDED.year, profiles.year),
    phone = COALESCE(EXCLUDED.phone, profiles.phone);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrow_records ENABLE ROW LEVEL SECURITY;

-- 9. RLS POLICIES FOR PROFILES
DROP POLICY IF EXISTS "Anyone authenticated can view profiles" ON public.profiles;
CREATE POLICY "Anyone authenticated can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Public can view active profiles" ON public.profiles;
CREATE POLICY "Public can view active profiles"
  ON public.profiles FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_admin() OR auth.role() = 'authenticated')
  WITH CHECK (public.is_admin() OR auth.role() = 'authenticated');

-- 10. RLS POLICIES FOR BOOKS
DROP POLICY IF EXISTS "Public can view books" ON public.books;
CREATE POLICY "Public can view books"
  ON public.books FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Admins can insert books" ON public.books;
CREATE POLICY "Admins can insert books"
  ON public.books FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update books" ON public.books;
CREATE POLICY "Admins can update books"
  ON public.books FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete books" ON public.books;
CREATE POLICY "Admins can delete books"
  ON public.books FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 11. RLS POLICIES FOR BORROW RECORDS
DROP POLICY IF EXISTS "Students can view own borrow records" ON public.borrow_records;
CREATE POLICY "Students can view own borrow records"
  ON public.borrow_records FOR SELECT
  TO authenticated
  USING (student_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert borrow records" ON public.borrow_records;
CREATE POLICY "Admins can insert borrow records"
  ON public.borrow_records FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update borrow records" ON public.borrow_records;
CREATE POLICY "Admins can update borrow records"
  ON public.borrow_records FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete borrow records" ON public.borrow_records;
CREATE POLICY "Admins can delete borrow records"
  ON public.borrow_records FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 12. STORAGE BUCKETS (book-covers & avatars)
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-covers', 'book-covers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies for Public Reading
DROP POLICY IF EXISTS "Public access to book covers" ON storage.objects;
CREATE POLICY "Public access to book covers"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'book-covers');

DROP POLICY IF EXISTS "Public access to avatars" ON storage.objects;
CREATE POLICY "Public access to avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- Storage Policies for Uploads
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated users can update own avatars" ON storage.objects;
CREATE POLICY "Authenticated users can update own avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Admins can manage book covers" ON storage.objects;
CREATE POLICY "Admins can manage book covers"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'book-covers' AND (public.is_admin() OR auth.role() = 'authenticated'))
  WITH CHECK (bucket_id = 'book-covers');

-- 13. SEED BOOKS DATA (Rich starter collection across disciplines)
INSERT INTO public.books (title, author, isbn, category, total_copies, available_copies, cover_url)
VALUES
('Introduction to Algorithms (4th Edition)', 'Thomas H. Cormen, Charles E. Leiserson', '978-0262046305', 'Computer Science', 8, 6, 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=500&auto=format&fit=crop&q=60'),
('Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', '978-0132350884', 'Computer Science', 5, 4, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60'),
('Artificial Intelligence: A Modern Approach', 'Stuart Russell, Peter Norvig', '978-0134610993', 'AI & Data Science', 6, 5, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60'),
('Deep Learning', 'Ian Goodfellow, Yoshua Bengio, Aaron Courville', '978-0262035613', 'AI & Data Science', 4, 3, 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=500&auto=format&fit=crop&q=60'),
('Microelectronic Circuits (8th Edition)', 'Adel S. Sedra, Kenneth C. Smith', '978-0190853464', 'Electronics', 5, 5, 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=500&auto=format&fit=crop&q=60'),
('Signals and Systems', 'Alan V. Oppenheim, Alan S. Willsky', '978-0138147570', 'Electronics', 4, 2, 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=60'),
('Calculus: Early Transcendentals', 'James Stewart', '978-1285741550', 'Mathematics', 10, 8, 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&auto=format&fit=crop&q=60'),
('Linear Algebra and Its Applications', 'Gilbert Strang', '978-0030105678', 'Mathematics', 7, 6, 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=60'),
('University Physics with Modern Physics', 'Hugh D. Young, Roger A. Freedman', '978-0135159552', 'Physics', 6, 4, 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60'),
('To Kill a Mockingbird', 'Harper Lee', '978-0061120084', 'Literature', 6, 6, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=60'),
('The Great Gatsby', 'F. Scott Fitzgerald', '978-0743273565', 'Literature', 5, 3, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=60'),
('Principles of Corporate Finance', 'Richard A. Brealey, Stewart C. Myers', '978-1260013900', 'Business', 4, 3, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=60')
ON CONFLICT (isbn) DO NOTHING;

-- 14. INSTRUCTIONS TO MAKE A USER AN ADMIN:
-- Once an admin account signs up in the app, run this single query with their email:
-- UPDATE public.profiles SET role = 'admin' WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@college.edu');
