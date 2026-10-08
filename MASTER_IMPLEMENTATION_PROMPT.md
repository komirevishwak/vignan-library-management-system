# Master Implementation Prompt for Vignandhara Library Management System

**Copy this entire prompt and paste it into Claude in VS Code to implement all critical improvements**

---

## Project Context

You are working on the **Vignandhara Library Management System**, a Next.js 14 college library management web application using Supabase (PostgreSQL), Tailwind CSS, and React. The project is located at `C:\vishwaknew`.

**Current Tech Stack:**
- Next.js 14.2.15 (App Router, JavaScript)
- Supabase (@supabase/supabase-js ^2.45.4, @supabase/ssr ^0.5.1)
- Tailwind CSS 3.4.13
- React 18.3.1
- Lucide React icons

**Project Structure:**
```
├── src/
│   ├── app/
│   │   ├── admin/          # Admin portal
│   │   ├── student/        # Student portal
│   │   ├── api/            # API routes
│   │   └── globals.css
│   ├── components/         # Reusable components
│   └── lib/
│       ├── supabase/       # Supabase clients
│       └── utils.js        # Utility functions
├── public/
├── supabase-schema.sql
└── package.json
```

---

## Your Mission

Implement **Phase 1 (Critical Priority)** improvements to transform this from a traditional library system into a modern, accessible, new-age digital library platform. Focus on high-ROI enhancements that provide immediate value.

---

## Phase 1: Critical Improvements to Implement

### 1. ACCESSIBILITY COMPLIANCE (WCAG 2.1 AA)

**Objective:** Make the entire application accessible to users with disabilities.

**Tasks:**

#### 1.1 Add Semantic HTML & ARIA Labels
- Review all components and pages
- Add proper ARIA labels to all interactive elements
- Use semantic HTML tags (`<nav>`, `<main>`, `<article>`, `<aside>`, `<header>`)
- Add `role` attributes where needed
- Ensure all images have descriptive `alt` text
- Add `aria-label` to icon-only buttons
- Implement skip-to-content links

**Files to Update:**
- All components in `src/components/`
- All pages in `src/app/student/` and `src/app/admin/`
- Special attention to: `Navbar.js`, `Sidebar.js`, `Header.js`, `Modal.js`, `BookCard.js`

#### 1.2 Keyboard Navigation
- Ensure all interactive elements are keyboard accessible (Tab, Enter, Space, Escape)
- Add visible focus indicators (custom Tailwind focus styles)
- Implement keyboard shortcuts for common actions
- Add focus trap in modals
- Ensure dropdown menus work with arrow keys

**Implementation Pattern:**
```javascript
// Example for keyboard-accessible modal
const handleKeyDown = (e) => {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Enter' || e.key === ' ') performAction();
};

<button
  onClick={handleClick}
  onKeyDown={handleKeyDown}
  aria-label="Close modal"
  className="focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
>
```

#### 1.3 Color Contrast & Visual Accessibility
- Audit all text/background color combinations for WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
- Fix any failing contrast ratios in `globals.css` and component styles
- Ensure interactive states (hover, focus, active) are distinguishable
- Don't rely solely on color to convey information

#### 1.4 Screen Reader Testing Setup
- Add a `docs/accessibility-testing.md` guide
- Document how to test with NVDA/JAWS (Windows) and VoiceOver (Mac)
- Create accessibility checklist for future features

---

### 2. DARK MODE IMPLEMENTATION

**Objective:** Provide a dark theme option for better readability and reduced eye strain.

**Tasks:**

#### 2.1 Theme System Setup
- Create a theme context provider in `src/contexts/ThemeContext.js`
- Store theme preference in localStorage
- Support system preference detection (`prefers-color-scheme`)

**Implementation:**
```javascript
// src/contexts/ThemeContext.js
'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initial = stored || systemPreference;
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

#### 2.2 Tailwind Dark Mode Configuration
- Update `tailwind.config.js` to enable class-based dark mode:
```javascript
module.exports = {
  darkMode: 'class',
  // ... rest of config
}
```

#### 2.3 Apply Dark Mode Styles
- Update `globals.css` with dark mode variables
- Add dark mode variants to all components using Tailwind's `dark:` prefix
- Ensure proper contrast in dark mode (background, text, borders, shadows)

**Pattern:**
```javascript
className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
```

#### 2.4 Theme Toggle Component
- Add theme toggle button to `Navbar.js` and `Header.js`
- Use sun/moon icons from lucide-react
- Make toggle accessible (proper ARIA labels)

---

### 3. EMAIL NOTIFICATION SYSTEM

**Objective:** Send automated emails for due dates, overdue books, and welcome messages.

**Tasks:**

#### 3.1 Choose Email Service
- Set up **Resend** (recommended) or **SendGrid**
- Add API key to `.env.local`: `RESEND_API_KEY=your_key_here`
- Install package: `npm install resend`

#### 3.2 Create Email Service
- Create `src/lib/email-service.js`:
```javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDueDateReminder({ to, studentName, bookTitle, dueDate }) {
  return await resend.emails.send({
    from: 'Vignandhara Library <library@yourdomain.com>',
    to,
    subject: `Reminder: "${bookTitle}" due on ${dueDate}`,
    html: `
      <h2>Book Due Date Reminder</h2>
      <p>Hi ${studentName},</p>
      <p>This is a friendly reminder that your borrowed book <strong>"${bookTitle}"</strong> is due on <strong>${dueDate}</strong>.</p>
      <p>Please return it on time to avoid late fees.</p>
      <p>Thank you!</p>
    `
  });
}

export async function sendOverdueNotification({ to, studentName, bookTitle, daysOverdue, fineAmount }) {
  // Similar implementation
}

export async function sendWelcomeEmail({ to, studentName, rollNumber }) {
  // Similar implementation
}
```

#### 3.3 Create Notification API Routes
- `src/app/api/notifications/send-reminders/route.js` - Daily cron job endpoint
- `src/app/api/notifications/send-overdue/route.js` - Overdue notifications

#### 3.4 Implement Supabase Edge Function or Cron Job
- Document how to set up daily cron job (Vercel Cron, GitHub Actions, or Supabase Edge Functions)
- Create `docs/cron-setup.md` with instructions

#### 3.5 Update User Preferences
- Add email notification preferences to student profile
- Allow students to opt-in/opt-out of reminder emails
- Add columns to `profiles` table:
```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS reminder_days_before INTEGER DEFAULT 2;
```

---

### 4. ADVANCED SEARCH WITH FILTERS

**Objective:** Dramatically improve book discoverability with faceted search and filters.

**Tasks:**

#### 4.1 Enhance Database Schema
Add search-friendly indexes and full-text search:
```sql
-- Add to supabase-schema.sql

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_books_search ON public.books 
USING gin(to_tsvector('english', title || ' ' || author || ' ' || COALESCE(description, '')));

-- Additional indexes
CREATE INDEX IF NOT EXISTS idx_books_category_availability ON public.books(category, available_copies);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON public.books(created_at DESC);
```

#### 4.2 Update Book Catalog Page
Enhance `src/app/student/catalog/page.js`:

**Add Filter State:**
```javascript
const [filters, setFilters] = useState({
  category: 'All',
  availability: 'all', // 'all', 'available', 'unavailable'
  sortBy: 'title', // 'title', 'author', 'newest', 'popular'
  sortOrder: 'asc'
});
```

**Add Filter UI Components:**
- Availability toggle (Available Only / All Books)
- Sort dropdown (Title A-Z, Author A-Z, Newest First, Most Popular)
- Clear all filters button
- Active filters badge count

#### 4.3 Update Search API
Create/update `src/app/api/books/search/route.js`:
```javascript
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const category = searchParams.get('category');
  const availability = searchParams.get('availability');
  const sortBy = searchParams.get('sortBy');
  
  let supabaseQuery = supabase
    .from('books')
    .select('*');
  
  // Full-text search
  if (query) {
    supabaseQuery = supabaseQuery.textSearch('fts', query);
  }
  
  // Category filter
  if (category && category !== 'All') {
    supabaseQuery = supabaseQuery.eq('category', category);
  }
  
  // Availability filter
  if (availability === 'available') {
    supabaseQuery = supabaseQuery.gt('available_copies', 0);
  }
  
  // Sorting
  switch(sortBy) {
    case 'title':
      supabaseQuery = supabaseQuery.order('title', { ascending: true });
      break;
    case 'newest':
      supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
      break;
    // Add more sort options
  }
  
  const { data, error } = await supabaseQuery;
  return Response.json({ books: data });
}
```

#### 4.4 Add Search History & Saved Searches
- Store recent searches in localStorage
- Show search suggestions based on history
- Add "Save this search" button for students

---

### 5. ADMIN ANALYTICS DASHBOARD

**Objective:** Provide data-driven insights for library management.

**Tasks:**

#### 5.1 Create Analytics Database Views
Add to `supabase-schema.sql`:
```sql
-- Most borrowed books
CREATE OR REPLACE VIEW public.popular_books AS
SELECT 
  b.id,
  b.title,
  b.author,
  b.category,
  COUNT(br.id) as borrow_count,
  COUNT(DISTINCT br.student_id) as unique_borrowers
FROM public.books b
LEFT JOIN public.borrow_records br ON b.id = br.book_id
GROUP BY b.id, b.title, b.author, b.category
ORDER BY borrow_count DESC;

-- Circulation statistics
CREATE OR REPLACE VIEW public.circulation_stats AS
SELECT 
  DATE_TRUNC('month', issue_date) as month,
  COUNT(*) as total_borrows,
  COUNT(DISTINCT student_id) as active_students,
  AVG(EXTRACT(EPOCH FROM (COALESCE(return_date, NOW()) - issue_date)) / 86400) as avg_borrow_days
FROM public.borrow_records
GROUP BY DATE_TRUNC('month', issue_date)
ORDER BY month DESC;

-- Category distribution
CREATE OR REPLACE VIEW public.category_distribution AS
SELECT 
  category,
  COUNT(*) as book_count,
  SUM(total_copies) as total_copies,
  SUM(available_copies) as available_copies,
  ROUND(AVG(total_copies - available_copies)::numeric, 2) as avg_borrowed
FROM public.books
GROUP BY category;
```

#### 5.2 Create Analytics API Routes
- `src/app/api/admin/analytics/overview/route.js`
- `src/app/api/admin/analytics/popular-books/route.js`
- `src/app/api/admin/analytics/circulation/route.js`
- `src/app/api/admin/analytics/categories/route.js`

#### 5.3 Build Analytics Dashboard Page
Create `src/app/admin/analytics/page.js`:

**Include:**
- **Summary Cards:** Total borrows this month, active students, overdue books, total fines collected
- **Line Chart:** Borrowing trends over last 6 months
- **Bar Chart:** Top 10 most borrowed books
- **Pie Chart:** Category distribution
- **Table:** Recent activity log
- **Export Button:** Download reports as CSV

**Use Chart Library:**
```bash
npm install recharts
```

**Example Chart Component:**
```javascript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

<LineChart width={800} height={400} data={circulationData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="month" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="total_borrows" stroke="#8b5cf6" />
</LineChart>
```

#### 5.4 Add Export Functionality
- CSV export for all analytics data
- PDF report generation (optional, use jsPDF)
- Email report scheduling (optional Phase 2)

---

### 6. BOOK REVIEWS & RATINGS SYSTEM

**Objective:** Build community engagement through peer reviews.

**Tasks:**

#### 6.1 Database Schema
Add to `supabase-schema.sql`:
```sql
-- Book reviews and ratings
CREATE TABLE IF NOT EXISTS public.book_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT CHECK (char_length(review_text) BETWEEN 10 AND 2000),
  is_verified_borrower BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(book_id, student_id) -- One review per student per book
);

-- Helpful votes tracking
CREATE TABLE IF NOT EXISTS public.review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.book_reviews(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(review_id, student_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_book ON public.book_reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_reviews_student ON public.book_reviews(student_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON public.book_reviews(created_at DESC);

-- RLS Policies
ALTER TABLE public.book_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view reviews" ON public.book_reviews;
CREATE POLICY "Anyone can view reviews"
  ON public.book_reviews FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Students can create reviews" ON public.book_reviews;
CREATE POLICY "Students can create reviews"
  ON public.book_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can update own reviews" ON public.book_reviews;
CREATE POLICY "Students can update own reviews"
  ON public.book_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id);

-- Function to update average rating
CREATE OR REPLACE FUNCTION update_book_average_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.books
  SET average_rating = (
    SELECT AVG(rating)::numeric(3,2)
    FROM public.book_reviews
    WHERE book_id = COALESCE(NEW.book_id, OLD.book_id)
  ),
  review_count = (
    SELECT COUNT(*)
    FROM public.book_reviews
    WHERE book_id = COALESCE(NEW.book_id, OLD.book_id)
  )
  WHERE id = COALESCE(NEW.book_id, OLD.book_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_on_review
AFTER INSERT OR UPDATE OR DELETE ON public.book_reviews
FOR EACH ROW
EXECUTE FUNCTION update_book_average_rating();

-- Add columns to books table
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
```

#### 6.2 Create Review API Routes
- `src/app/api/reviews/[bookId]/route.js` - GET reviews, POST new review
- `src/app/api/reviews/[reviewId]/helpful/route.js` - Mark review as helpful
- `src/app/api/reviews/my-reviews/route.js` - Get user's reviews

#### 6.3 Create Review Components
`src/components/BookReviews.js`:
```javascript
- Star rating display
- Review list with pagination
- Review form (star picker + text area)
- "Helpful" button with count
- Verified borrower badge
- Edit/delete for own reviews
```

`src/components/StarRating.js`:
```javascript
- Interactive star picker (1-5 stars)
- Read-only star display
- Accessible keyboard navigation
```

#### 6.4 Integrate Reviews into Catalog
- Update `BookCard.js` to show average rating and review count
- Add reviews section to book detail modal
- Show reviews on `/student/catalog` pages

---

### 7. READING PROGRESS TRACKING (Digital Books)

**Objective:** Track student reading progress for digital books.

**Tasks:**

#### 7.1 Database Schema
```sql
CREATE TABLE IF NOT EXISTS public.reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  digital_borrowing_id UUID NOT NULL, -- References digital_borrowings table
  current_page INTEGER DEFAULT 1,
  total_pages INTEGER NOT NULL,
  current_position TEXT, -- JSON string for complex position data
  progress_percentage INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN total_pages > 0 THEN LEAST(100, (current_page * 100) / total_pages)
      ELSE 0
    END
  ) STORED,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, digital_borrowing_id)
);

CREATE INDEX IF NOT EXISTS idx_reading_progress_student ON public.reading_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_borrowing ON public.reading_progress(digital_borrowing_id);

-- RLS
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own progress"
  ON public.reading_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own progress"
  ON public.reading_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own progress"
  ON public.reading_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id);
```

#### 7.2 Update Reader Page
Enhance `src/app/student/reader/[id]/page.js`:
- Add progress bar at top
- Auto-save reading position every 30 seconds
- Show "Resume reading" button that jumps to last position
- Display reading statistics (time spent, pages read today)

#### 7.3 Create Progress API
- `src/app/api/reading-progress/[borrowingId]/route.js` - GET/POST progress
- Debounce progress updates to avoid excessive database writes

#### 7.4 Add Progress Visualization
- Show progress badges on "My Digital Books" page
- Add reading streak tracking (days in a row)
- Completion certificate generation (optional)

---

### 8. IMPROVED DIGITAL BOOK READER

**Objective:** Enhance the reading experience with better controls.

**Tasks:**

#### 8.1 Reader Settings Panel
Add to `src/app/student/reader/[id]/page.js`:
```javascript
- Font size adjustment (small, medium, large, extra large)
- Font family selector (serif, sans-serif, dyslexic-friendly)
- Line height adjustment
- Background color (white, sepia, dark)
- Text alignment (left, justify)
- Zoom controls
```

#### 8.2 Reading Tools
- Bookmark current page
- Highlight text (store highlights in database)
- Add notes (store notes in database)
- Table of contents navigation
- Search within book
- Page number display

#### 8.3 Create Bookmarks & Notes Schema
```sql
CREATE TABLE IF NOT EXISTS public.reading_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  digital_borrowing_id UUID NOT NULL,
  page_number INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reading_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  digital_borrowing_id UUID NOT NULL,
  page_number INTEGER NOT NULL,
  selected_text TEXT NOT NULL,
  highlight_color TEXT DEFAULT 'yellow',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### 8.4 Reader Keyboard Shortcuts
- Arrow keys: Next/previous page
- Space: Next page
- Home/End: First/last page
- B: Toggle bookmarks panel
- H: Highlight selected text
- F: Toggle fullscreen
- S: Open settings

---

### 9. NOTIFICATION PREFERENCES

**Objective:** Let students control their notification settings.

**Tasks:**

#### 9.1 Add Preferences UI
Update `src/app/student/profile/page.js`:
```javascript
<section>
  <h3>Notification Preferences</h3>
  
  <label>
    <input type="checkbox" checked={emailNotifications} />
    Email notifications enabled
  </label>
  
  <label>
    Remind me
    <select value={reminderDays}>
      <option value="1">1 day before due date</option>
      <option value="2">2 days before due date</option>
      <option value="3">3 days before due date</option>
      <option value="7">1 week before due date</option>
    </select>
  </label>
  
  <fieldset>
    <legend>Notify me about:</legend>
    <label><input type="checkbox" /> Due date reminders</label>
    <label><input type="checkbox" /> Overdue notices</label>
    <label><input type="checkbox" /> New book arrivals</label>
    <label><input type="checkbox" /> Reservation availability</label>
  </fieldset>
</section>
```

#### 9.2 Update Profile Schema
Already included in notification section above.

---

### 10. MOBILE RESPONSIVENESS AUDIT

**Objective:** Ensure perfect mobile experience.

**Tasks:**

#### 10.1 Test All Pages on Mobile
- Use Chrome DevTools device emulation
- Test on actual devices (iOS Safari, Android Chrome)
- Check touch targets (minimum 44x44px)
- Test landscape and portrait orientations

#### 10.2 Fix Common Mobile Issues
- Ensure tables are scrollable or stacked on mobile
- Fix any overflow issues
- Ensure modals don't cut off on small screens
- Add mobile-specific navigation (hamburger menu)
- Test form inputs (proper keyboard types, no zoom on focus)

#### 10.3 Add Progressive Web App (PWA) Support
Create `public/manifest.json`:
```json
{
  "name": "Vignandhara Library",
  "short_name": "Vignandhara",
  "description": "College Library Management System",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#8b5cf6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Add to `src/app/layout.js`:
```javascript
export const metadata = {
  manifest: '/manifest.json',
  themeColor: '#8b5cf6',
  // ... other metadata
};
```

Create `public/sw.js` (service worker) for offline support.

---

## Implementation Guidelines

### Code Quality Standards
1. **Follow existing patterns:** Match the coding style already in the project
2. **Use TypeScript-ready code:** Even though project uses .js, write type-safe code
3. **Error handling:** Wrap all async operations in try-catch, show user-friendly errors
4. **Loading states:** Add skeleton loaders or spinners for all async operations
5. **Optimistic updates:** Update UI immediately, revert on error
6. **Accessibility first:** Every new component must be keyboard accessible with proper ARIA

### Testing Checklist
Before marking any feature complete, test:
- ✅ Works on mobile (Chrome DevTools + actual device)
- ✅ Works with keyboard only (no mouse)
- ✅ Works with screen reader (test with NVDA or VoiceOver)
- ✅ Works in dark mode
- ✅ Error states display properly
- ✅ Loading states display properly
- ✅ Data persists correctly in Supabase
- ✅ RLS policies prevent unauthorized access

### Database Migration Process
1. Test all SQL in Supabase SQL Editor first
2. Back up production data before running migrations
3. Run migrations during low-traffic periods
4. Add rollback SQL comments for each migration
5. Update `supabase-schema.sql` with all changes

### Deployment Steps
1. Update `.env.local.example` with new environment variables
2. Test locally with `npm run dev`
3. Run `npm run build` to check for build errors
4. Update `README.md` with new features
5. Create migration guide in `docs/MIGRATION.md`
6. Deploy to Vercel/production

---

## Priority Order (Recommended Sequence)

### Week 1-2: Foundation
1. ✅ Accessibility compliance (ARIA, semantic HTML, keyboard nav)
2. ✅ Dark mode implementation
3. ✅ Mobile responsiveness fixes

### Week 3-4: User Experience
4. ✅ Advanced search with filters
5. ✅ Email notification system setup
6. ✅ Notification preferences UI

### Week 5-6: Engagement Features
7. ✅ Book reviews and ratings
8. ✅ Reading progress tracking
9. ✅ Enhanced digital reader

### Week 7-8: Analytics & Polish
10. ✅ Admin analytics dashboard
11. ✅ PWA setup
12. ✅ Comprehensive testing and bug fixes

---

## Success Metrics

After implementation, the system should achieve:
- ✅ **WCAG 2.1 AA compliance** (test with axe DevTools)
- ✅ **90+ Lighthouse scores** (Performance, Accessibility, Best Practices, SEO)
- ✅ **<3 second page load times**
- ✅ **Zero critical accessibility violations**
- ✅ **100% keyboard navigability**
- ✅ **Mobile responsiveness** on all screen sizes (320px to 4K)

---

## Files That Will Be Created/Modified

### New Files to Create (Estimated 25+ files)
```
src/contexts/ThemeContext.js
src/lib/email-service.js
src/components/StarRating.js
src/components/BookReviews.js
src/components/ProgressBar.js
src/components/ReaderSettings.js
src/components/analytics/OverviewCards.js
src/components/analytics/CirculationChart.js
src/components/analytics/CategoryChart.js
src/app/admin/analytics/page.js
src/app/api/notifications/send-reminders/route.js
src/app/api/notifications/send-overdue/route.js
src/app/api/reviews/[bookId]/route.js
src/app/api/reviews/[reviewId]/helpful/route.js
src/app/api/reading-progress/[borrowingId]/route.js
src/app/api/admin/analytics/overview/route.js
src/app/api/admin/analytics/popular-books/route.js
src/app/api/admin/analytics/circulation/route.js
src/app/api/books/search/route.js
public/manifest.json
public/sw.js
docs/accessibility-testing.md
docs/cron-setup.md
docs/MIGRATION.md
supabase-migrations.sql (with all schema updates)
```

### Files to Modify (Estimated 30+ files)
```
src/app/layout.js (add ThemeProvider, PWA manifest)
src/app/globals.css (dark mode styles)
src/app/student/catalog/page.js (enhanced search & filters)
src/app/student/dashboard/page.js (add progress indicators)
src/app/student/profile/page.js (notification preferences)
src/app/student/reader/[id]/page.js (enhanced reader)
src/app/admin/dashboard/page.js (add analytics link)
src/components/Navbar.js (theme toggle, accessibility)
src/components/Sidebar.js (accessibility)
src/components/Header.js (theme toggle)
src/components/BookCard.js (ratings display, accessibility)
src/components/Modal.js (focus trap, keyboard nav)
tailwind.config.js (dark mode, custom focus styles)
package.json (new dependencies)
.env.local.example (new env vars)
README.md (updated feature list)
supabase-schema.sql (all new tables and migrations)
```

---

## New Dependencies to Install

```bash
# Email service
npm install resend

# Charts and analytics
npm install recharts

# Utilities
npm install date-fns  # Better date handling
npm install clsx tailwind-merge  # Already installed, but confirm

# Optional (Phase 2)
npm install @radix-ui/react-dropdown-menu  # Accessible dropdowns
npm install @radix-ui/react-dialog  # Accessible modals
npm install jspdf  # PDF generation for reports
```

---

## Environment Variables to Add

Update `.env.local`:
```bash
# Existing
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# New additions
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=library@yourdomain.com
CRON_SECRET=random_secret_for_cron_security

# Optional
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## Important Notes

### 1. Backward Compatibility
- All database migrations must be non-breaking
- Existing data must remain accessible
- Add new columns with DEFAULT values
- Don't remove or rename existing columns without data migration

### 2. Performance Considerations
- Use database indexes for all filtered/sorted columns
- Implement pagination for large datasets (reviews, history)
- Lazy load charts on analytics page
- Optimize images (use Next.js Image component)
- Enable Supabase connection pooling for production

### 3. Security Checklist
- ✅ All API routes validate user authentication
- ✅ RLS policies enforce data access rules
- ✅ Sanitize user input (reviews, notes)
- ✅ Rate limit email sending to prevent abuse
- ✅ Validate file uploads (if adding new upload features)
- ✅ Use HTTPS in production
- ✅ Set proper CORS headers

### 4. Supabase Best Practices
- Use prepared statements (already handled by Supabase client)
- Enable Row Level Security on ALL tables
- Test RLS policies with different user roles
- Use Supabase Edge Functions for cron jobs (or Vercel Cron)
- Monitor database performance in Supabase dashboard

---

## Troubleshooting Guide

### Common Issues

**1. Dark mode not persisting:**
- Check localStorage is accessible
- Verify ThemeProvider wraps entire app
- Ensure 'dark' class is on `<html>` element

**2. Email notifications not sending:**
- Verify Resend API key is valid
- Check Vercel environment variables are set
- Test email service in development first
- Check spam folder

**3. Charts not rendering:**
- Ensure recharts is installed
- Check data format matches chart expectations
- Verify ResponsiveContainer wrapper is used
- Test with dummy data first

**4. Accessibility violations:**
- Run axe DevTools extension
- Test with actual screen reader
- Verify focus indicators are visible
- Check color contrast ratios

**5. Performance issues:**
- Use React DevTools Profiler
- Check for unnecessary re-renders
- Implement proper memo/useMemo/useCallback
- Optimize database queries (EXPLAIN ANALYZE)

---

## Final Deliverables

When complete, ensure these exist:
1. ✅ All features working in development
2. ✅ All database migrations in `supabase-migrations.sql`
3. ✅ Updated `README.md` with new features
4. ✅ `docs/MIGRATION.md` with upgrade instructions
5. ✅ `docs/accessibility-testing.md` with testing guide
6. ✅ `docs/cron-setup.md` with email automation setup
7. ✅ Updated `.env.local.example` with all new vars
8. ✅ Passing build: `npm run build` with no errors
9. ✅ Lighthouse scores 90+ across all categories
10. ✅ Zero critical accessibility violations (axe DevTools)

---

## Questions to Ask Before Starting

Before you begin implementation, please confirm:

1. **Database Access:** Do you have access to Supabase SQL Editor to run migrations?
2. **Email Service:** Should I use Resend or do you prefer SendGrid/another service?
3. **Design Preferences:** Any specific color schemes for dark mode or charts?
4. **Priority Adjustments:** Should any features be moved up/down in priority?
5. **Existing Issues:** Any known bugs that should be fixed during this implementation?

---

## Let's Begin! 🚀

Read through this entire prompt carefully, then start with **Week 1-2 (Foundation)** tasks. Work methodically through each feature, testing thoroughly before moving to the next. If you encounter any blockers or need clarification, ask before making assumptions.

**Remember:** Quality over speed. It's better to implement one feature perfectly than rush through multiple features with bugs.

Good luck! You're building something awesome. 💜

---

**End of Master Prompt**
