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
    role TEXT NOT NULL DEFAULT 'student' CHECK (role = 'student'),
    photo_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

  -- Admin identities are allowlisted Auth users; passwords remain managed and hashed by Supabase Auth.
  CREATE TABLE IF NOT EXISTS public.admin_accounts (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL DEFAULT 'Library Administrator',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  -- Student suggestions and issue reports share one workflow for the help desk.
  CREATE TABLE IF NOT EXISTS public.suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL DEFAULT 'General Feedback' CHECK (category IN ('Bug', 'Book Request', 'General Feedback')),
    description TEXT NOT NULL CHECK (char_length(description) BETWEEN 1 AND 4000),
    status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
    description TEXT,
    digital_reading_url TEXT,
    digital_access_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

  ALTER TABLE public.books ADD COLUMN IF NOT EXISTS description TEXT;
  ALTER TABLE public.books ADD COLUMN IF NOT EXISTS digital_reading_url TEXT;
  ALTER TABLE public.books ADD COLUMN IF NOT EXISTS digital_access_note TEXT;

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
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON public.profiles(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_suggestions_student ON public.suggestions(student_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON public.suggestions(status);
CREATE INDEX IF NOT EXISTS idx_suggestions_created ON public.suggestions(created_at DESC);

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_accounts
    WHERE id = auth.uid() AND is_active = TRUE
  );
$$;
CREATE INDEX IF NOT EXISTS idx_books_category ON public.books(category);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON public.books(isbn);
CREATE INDEX IF NOT EXISTS idx_borrow_student ON public.borrow_records(student_id);
CREATE INDEX IF NOT EXISTS idx_borrow_book ON public.borrow_records(book_id);
CREATE INDEX IF NOT EXISTS idx_borrow_status ON public.borrow_records(status);

-- 6. TRIGGER FOR AUTO PROFILE CREATION ON USER SIGNUP
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
    'student',
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

-- 7. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrow_records ENABLE ROW LEVEL SECURITY;

-- 8. RLS POLICIES FOR PROFILES
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
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- 9. RLS POLICIES FOR BOOKS
DROP POLICY IF EXISTS "Public can view books" ON public.books;
CREATE POLICY "Public can view books"
  ON public.books FOR SELECT
  TO public
  USING (true);

-- 10. RLS POLICIES FOR BORROW RECORDS
DROP POLICY IF EXISTS "Students can view own borrow records" ON public.borrow_records;
CREATE POLICY "Students can view own borrow records"
  ON public.borrow_records FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all borrow records" ON public.borrow_records;
CREATE POLICY "Admins can view all borrow records"
  ON public.borrow_records FOR SELECT
  TO authenticated
  USING (public.is_admin_user());

-- 11. ADMIN ACCOUNTS AND STUDENT SUGGESTIONS
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view own account" ON public.admin_accounts;
CREATE POLICY "Admins can view own account"
  ON public.admin_accounts FOR SELECT
  TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Students can submit suggestions" ON public.suggestions;
CREATE POLICY "Students can submit suggestions"
  ON public.suggestions FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can view own suggestions" ON public.suggestions;
CREATE POLICY "Students can view own suggestions"
  ON public.suggestions FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all suggestions" ON public.suggestions;
CREATE POLICY "Admins can view all suggestions"
  ON public.suggestions FOR SELECT
  TO authenticated
  USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can update suggestions" ON public.suggestions;
CREATE POLICY "Admins can update suggestions"
  ON public.suggestions FOR UPDATE
  TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- To provision an administrator, first create the Auth user with Supabase Auth,
-- then run this allowlist insert. The password is never stored in this table.
-- INSERT INTO public.admin_accounts (id, email, full_name)
-- SELECT id, email, 'Library Administrator'
-- FROM auth.users
-- WHERE email = 'librarian@college.edu';

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

-- All catalog titles are readable; stock is no longer used as a checked-out state.
UPDATE public.books
SET available_copies = total_copies;

-- ==========================================================
-- 15. DIGITAL BOOKS (e-Books) & DIGITAL BORROWINGS
-- ==========================================================

-- 15.1 DIGITAL BOOKS TABLE
CREATE TABLE IF NOT EXISTS public.digital_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT UNIQUE,
    category TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    file_url TEXT,
    file_size_mb NUMERIC NOT NULL DEFAULT 5.0,
    total_copies_available INT NOT NULL DEFAULT 999,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.digital_books ADD COLUMN IF NOT EXISTS cover_url TEXT;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'digital_books' AND column_name = 'cover_image_url'
  ) THEN
    EXECUTE 'UPDATE public.digital_books SET cover_url = COALESCE(cover_url, cover_image_url) WHERE cover_url IS NULL AND cover_image_url IS NOT NULL';
  END IF;
END $$;

-- 15.2 DIGITAL BORROWINGS TABLE (14-day access, strict 2-book limit)
CREATE TABLE IF NOT EXISTS public.digital_borrowings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    digital_book_id UUID NOT NULL REFERENCES public.digital_books(id) ON DELETE CASCADE,
    borrowed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    due_date TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '14 days'),
    returned_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'returned', 'expired')),
    pages_read INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15.3 INDEXES FOR HIGH-PERFORMANCE QUERIES
CREATE INDEX IF NOT EXISTS idx_digital_borrowings_student_status ON public.digital_borrowings(student_id, status);
CREATE INDEX IF NOT EXISTS idx_digital_borrowings_book_status ON public.digital_borrowings(digital_book_id, status);
CREATE INDEX IF NOT EXISTS idx_digital_borrowings_due_date ON public.digital_borrowings(due_date);
CREATE INDEX IF NOT EXISTS idx_digital_books_category ON public.digital_books(category);
CREATE INDEX IF NOT EXISTS idx_digital_books_title ON public.digital_books(title);

-- 15.4 ENABLE ROW LEVEL SECURITY
ALTER TABLE public.digital_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_borrowings ENABLE ROW LEVEL SECURITY;

-- 15.5 RLS POLICIES FOR DIGITAL BOOKS
DROP POLICY IF EXISTS "Anyone can view digital books" ON public.digital_books;
CREATE POLICY "Anyone can view digital books"
  ON public.digital_books FOR SELECT
  TO public
  USING (true);

-- 15.6 RLS POLICIES FOR DIGITAL BORROWINGS
DROP POLICY IF EXISTS "Students can view own digital borrowings" ON public.digital_borrowings;
CREATE POLICY "Students can view own digital borrowings"
  ON public.digital_borrowings FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can create own digital borrowings" ON public.digital_borrowings;
CREATE POLICY "Students can create own digital borrowings"
  ON public.digital_borrowings FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can update own digital borrowings" ON public.digital_borrowings;
CREATE POLICY "Students can update own digital borrowings"
  ON public.digital_borrowings FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- 15.7 SEED 16 DIGITAL BOOKS ACROSS 4 CORE DISCIPLINES
INSERT INTO public.digital_books (title, author, isbn, category, description, cover_url, file_url, file_size_mb, total_copies_available)
VALUES
-- Software Engineering
('Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', '978-0132350884', 'Software Engineering', 'Even bad code can function. But if code isn''t clean, it can bring a development organization to its knees. A timeless guide to writing readable, maintainable, and elegant software.', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', '/ebooks/clean-code.pdf', 8.4, 999),
('The Pragmatic Programmer: Your Journey to Mastery', 'David Thomas, Andrew Hunt', '978-0135957059', 'Software Engineering', 'One of the most significant books on software engineering. It cuts through the increasing specialization and technicalities of modern development to examine the core process.', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80', '/ebooks/pragmatic-programmer.pdf', 6.2, 999),
('Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', '978-0201633610', 'Software Engineering', 'The seminal work by the Gang of Four. Captures 23 classic software design patterns that solve recurring architectural problems in object-oriented software engineering.', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80', '/ebooks/design-patterns.pdf', 11.5, 999),
('Refactoring: Improving the Design of Existing Code', 'Martin Fowler', '978-0134757599', 'Software Engineering', 'Fowler explains the principles and best practices of refactoring, along with a catalog of proven code transformations to make legacy code clean and extensible.', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80', '/ebooks/refactoring.pdf', 7.8, 999),

-- DBMS
('Database System Concepts (7th Edition)', 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan', '978-0078022159', 'DBMS', 'The authoritative textbook presenting fundamental database management concepts, relational models, relational algebra, SQL, query optimization, and storage management.', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80', '/ebooks/database-system-concepts.pdf', 14.2, 999),
('SQL Performance Explained', 'Markus Winand', '978-3950307825', 'DBMS', 'A fast-paced guide to database indexing and SQL query tuning for developers. Learn how index structures work under the hood across Oracle, PostgreSQL, MySQL, and SQL Server.', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80', '/ebooks/sql-performance-explained.pdf', 4.5, 999),
('Transaction Processing: Concepts and Techniques', 'Jim Gray, Andreas Reuter', '978-1558601901', 'DBMS', 'The foundational classic on ACID transactions, concurrency control, logging, recovery, locking algorithms, and fault-tolerant system architecture by Turing Award winner Jim Gray.', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80', '/ebooks/transaction-processing.pdf', 18.0, 999),
('Database Internals: A Deep Dive into How Distributed Systems Work', 'Alex Petrov', '978-1492040347', 'DBMS', 'Comprehensive breakdown of internal storage engines (B-Trees, LSM-trees, buffer pools), write-ahead logging, and distributed replication primitives.', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80', '/ebooks/database-internals.pdf', 9.3, 999),

-- Distributed Database Management Systems
('Designing Data-Intensive Applications', 'Martin Kleppmann', '978-1449373320', 'Distributed Database Management Systems', 'An extraordinary tour through data systems: replication, partitioning, transactions, consensus, stream processing, and building reliable, scalable, and maintainable systems.', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80', '/ebooks/designing-data-intensive-applications.pdf', 15.6, 999),
('The Art of Distributed Systems', 'Arpit Bhayani', '978-9356281905', 'Distributed Database Management Systems', 'Clear, practical explanations of distributed hashing, gossip protocols, vector clocks, quorum sensing, Raft consensus, and real-world high-throughput distributed architectures.', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80', '/ebooks/art-of-distributed-systems.pdf', 5.1, 999),
('Consistency Models and Consensus Protocols', 'Leslie Lamport, Jim Dowling', '978-0262539401', 'Distributed Database Management Systems', 'Deep dive into linearizability, sequential consistency, eventual consistency, Paxos, Multi-Paxos, and Raft consensus algorithms in modern cloud databases.', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80', '/ebooks/consistency-models-consensus.pdf', 7.4, 999),
('Distributed Systems: Principles and Paradigms', 'Andrew S. Tanenbaum, Maarten van Steen', '978-1543057386', 'Distributed Database Management Systems', 'Classic authoritative treatise covering communication, processes, naming, synchronization, fault tolerance, and distributed file/database architectures.', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80', '/ebooks/distributed-systems-tanenbaum.pdf', 13.0, 999),

-- Machine Learning
('Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow', 'Aurélien Géron', '978-1098125974', 'Machine Learning', 'Through a series of recent breakthroughs, deep learning has boosted the entire field of machine learning. A comprehensive, concrete hands-on textbook with intuitive code and math.', 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&auto=format&fit=crop&q=80', '/ebooks/hands-on-machine-learning.pdf', 16.5, 999),
('Deep Learning (Adaptive Computation and Machine Learning)', 'Ian Goodfellow, Yoshua Bengio, Aaron Courville', '978-0262035613', 'Machine Learning', 'The definitive MIT Press deep learning bible. Covers mathematical foundations, linear algebra, deep feedforward networks, regularization, optimization, CNNs, and RNNs.', 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600&auto=format&fit=crop&q=80', '/ebooks/deep-learning-goodfellow.pdf', 19.8, 999),
('An Introduction to Statistical Learning (with Applications in R & Python)', 'Gareth James, Daniela Witten, Trevor Hastie, Robert Tibshirani', '978-1071614174', 'Machine Learning', 'A vital reference for statistical learning, covering regression, classification, resampling, tree-based models, support vector machines, unsupervised learning, and deep learning.', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', '/ebooks/statistical-learning.pdf', 10.2, 999),
('Machine Learning Yearning: Technical Strategy for AI Engineers', 'Andrew Ng', '978-0999804704', 'Machine Learning', 'AI Pioneer Andrew Ng teaches how to structure Machine Learning projects, identify bias/variance bottlenecks, prioritize error analysis, and deploy high-performing models rapidly.', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=80', '/ebooks/machine-learning-yearning.pdf', 4.8, 999)
ON CONFLICT (isbn) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  cover_url = EXCLUDED.cover_url,
  file_url = EXCLUDED.file_url;

-- 15.8 The authoritative 131-row technical catalog is imported from
-- insert_technical_books.sql with the idempotent upsert process documented below.
