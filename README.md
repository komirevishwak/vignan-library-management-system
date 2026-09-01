# 📚 Athena LMS — College Library Management System

A production-grade, modern, and mobile-responsive College Library Management System web app built with **Next.js 14 (App Router, JavaScript)**, **Tailwind CSS**, and **Supabase** (PostgreSQL database, Auth, Storage, and Row Level Security).

---

## ✨ Features

### 🎓 Student Portal (`/student/*`)
- **Dashboard**: Live metrics of currently borrowed books, return due dates, red overdue warnings, unpaid fine totals, and return milestones.
- **Book Catalog**: Real-time searchable book index (search by title, author, category, ISBN), category tabs, and availability stock pills.
- **Borrow History**: Full historical log of borrowed and returned books with due dates and payment settlement status.
- **Student Profile**: View and edit profile details, avatar upload to Supabase Storage, and password update.

### 🛡️ Admin Portal (`/admin/*`)
- **Admin Dashboard**: Real-time KPI summary cards (Total Books, Total Students, Currently Issued, Overdue Count, Total Unpaid Fines), and live circulation activity feed.
- **Book Inventory Management**: Complete CRUD operations for books with cover artwork upload to Supabase Storage, ISBN validation, and stock control.
- **Student Directory**: Searchable directory of registered students with department filters, student loan history viewer, and one-click account deactivation.
- **Circulation Desk (Issue & Return)**:
  - **Issue Book**: Select student + book, auto-set due date (+14 days standard loan), and automatic inventory decrement.
  - **Return Book**: Automatic fine calculation at **₹5.00/day** for overdue books, status update to 'returned', and inventory increment.
- **Fines & Fee Ledger**: Full table of outstanding and settled fines with one-click **"Mark as Paid"** action and live unpaid balance tracking.

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
   - This creates the `profiles`, `books`, and `borrow_records` tables.
   - It configures Row Level Security (RLS) policies.
   - It creates the `book-covers` and `avatars` public storage buckets.
   - It seeds initial academic books across Computer Science, AI, Electronics, Math, Physics, and Business.

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
1. Open the web app at `http://localhost:3000/signup` and register with your admin email (e.g. `admin@college.edu`).
2. Run this SQL query in your Supabase SQL Editor to grant admin privileges:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@college.edu');
```
3. Now log in at `/login` with that email and password to access the full **Admin Desk**!

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
│   │   │   ├── books/page.js         # Book inventory & artwork management
│   │   │   ├── dashboard/page.js     # Admin KPI metrics & live circulation stream
│   │   │   ├── fines/page.js         # Fines ledger & payment clearance
│   │   │   ├── issue-return/page.js  # 14-day book issue & return with auto ₹5/day fine
│   │   │   ├── layout.js             # Admin layout with sidebar & navigation
│   │   │   └── students/page.js      # Student directory & loan history
│   │   ├── student/
│   │   │   ├── catalog/page.js       # Live search & filter book catalog
│   │   │   ├── dashboard/page.js     # Active loans, overdue alerts & fines
│   │   │   ├── history/page.js       # Complete borrow & return history
│   │   │   ├── layout.js             # Student layout with sidebar & mobile drawer
│   │   │   └── profile/page.js       # Student profile & avatar management
│   │   ├── login/page.js             # Login with role-based routing
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
