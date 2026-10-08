# 📚 Vignandhara LMS — College Library Management System

A production-grade, modern, and mobile-responsive College Library Management System web app built with **Next.js 14 (App Router, JavaScript)**, **Tailwind CSS**, and **Supabase** (PostgreSQL database, Auth, Storage, and Row Level Security).

---

## ✨ Features

### 🎓 Student Portal (`/student/*`)
- **Dashboard**: Live metrics of currently borrowed books, return due dates, red overdue warnings, unpaid fine totals, and return milestones.
- **Book Catalog**: Real-time searchable book index (search by title, author, category, ISBN), category tabs, and availability stock pills.
- **Borrow History**: Full historical log of borrowed and returned books with due dates and payment settlement status.
- **Student Profile**: View and edit profile details, avatar upload to Supabase Storage, and password update.

### 🛡️ Admin Portal (`/admin/*`)
- **Separate Admin Login**: `/admin/login` uses Supabase Auth sessions and an `admin_accounts` allowlist; no admin password is stored by the application.
- **Operations Dashboard**: Live cards for registered students, available books, books in use, and students active within the last 15 minutes.
- **Student Directory**: Searchable student table with registration data and a profile modal containing borrowing history.
- **Help Desk**: Review student suggestions/issues and update their status to Open, In Progress, or Resolved.

### 💬 Student Suggestions
- Students can submit bugs, book requests, or general feedback from the dashboard.
- Submissions are stored in `suggestions` and appear directly in the admin Help Desk.

---

## 🚀 Quick Setup Instructions

### 1. Clone or Open the Project
Ensure you are in the project root directory:
```bash
cd college-library-management
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Supabase Database & Storage
1. Log into your [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Open the **SQL Editor** in the left sidebar of your Supabase project.
3. Open `supabase-schema.sql` from this repository, copy the entire SQL script, paste it into the Supabase SQL Editor, and click **Run**.
   - This creates the `profiles`, `admin_accounts`, `suggestions`, `books`, and `borrow_records` tables.
   - It configures Row Level Security (RLS) policies.
   - It creates the `book-covers` and `avatars` public storage buckets.
   - It seeds the academic catalog and configures the student/admin RLS policies.

Prepare the authoritative technical catalog as an idempotent ISBN upsert:
```bash
npm run prepare:technical-books
```
Run the generated `supabase-technical-books-upsert.sql` in Supabase SQL Editor. It upserts every row present in the supplied file by ISBN and assigns the 31 local open-access SVG covers. The supplied file currently contains 130 data rows (99 ISBN rows plus 31 `OPEN-*` rows), despite its 131-book description; no missing title is invented by this project.

### 4. Configure Environment Variables
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

Fill in your project credentials from **Project Settings -> API** in Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Create an Admin Account
1. In Supabase Dashboard, open **Authentication -> Users** and create the staff user with a password. Supabase Auth hashes and manages the password.
2. Run this SQL query in your Supabase SQL Editor to allowlist that Auth user:
```sql
INSERT INTO public.admin_accounts (id, email, full_name)
SELECT id, email, 'Library Administrator'
FROM auth.users
WHERE email = 'librarian@college.edu';
```
3. Open `/admin/login` and sign in with that staff email and password.

---

## 💻 Running the App Locally

Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 🌐 Zero-Config Vercel Deployment

1. Push your repository to GitHub or GitLab.
2. Import the repository into [Vercel](https://vercel.com).
3. In Vercel's **Environment Variables** settings, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon public key
4. Click **Deploy**. Vercel will build and deploy the Next.js 14 application seamlessly!

---

## 📁 Project Structure

```
├── public/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── login/page.js          # Isolated admin Auth login
│   │   │   ├── dashboard/page.js     # Admin stats, students & help desk
│   │   │   └── layout.js             # Admin session guard and navigation
│   │   ├── student/
│   │   │   ├── catalog/page.js       # Live search & filter book catalog
│   │   │   ├── dashboard/page.js     # Active loans, overdue alerts & fines
│   │   │   ├── history/page.js       # Complete borrow & return history
│   │   │   ├── layout.js             # Student layout with sidebar & mobile drawer
│   │   │   └── profile/page.js       # Student profile & avatar management
│   │   ├── login/page.js             # Student-only login
│   │   ├── signup/page.js            # Student registration with roll number
│   │   ├── globals.css               # Tailwind CSS styles & modern scrollbars
│   │   ├── layout.js                 # Root layout & setup banner
│   │   └── page.js                   # Public landing page with catalog preview
│   ├── components/
│   │   ├── BookCard.js               # Responsive book card with stock badge
│   │   ├── BorrowTable.js            # Reusable borrow record table with overdue tags
│   │   ├── EmptyState.js             # User-friendly empty state widget
│   │   ├── Header.js                 # Portal header with avatar & breadcrumbs
│   │   ├── Modal.js                  # Accessible modal dialog
│   │   ├── Navbar.js                 # Public navigation bar
│   │   ├── SetupBanner.js            # Interactive banner when env vars need config
│   │   ├── Sidebar.js                # Portal sidebar navigation & logout
│   │   └── StatCard.js               # KPI metric cards
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.js             # Browser Supabase client
│   │   │   ├── middleware.js         # Session validation & route guard
│   │   │   └── server.js             # Server Supabase client (SSR)
│   │   └── utils.js                  # Fine calculations, dates, currency formatting
│   └── middleware.js                 # Next.js route protection for /student and /admin
├── .env.local.example
├── next.config.js
├── package.json
├── supabase-schema.sql               # Complete SQL schema, RLS policies & seed data
└── tailwind.config.js
```
