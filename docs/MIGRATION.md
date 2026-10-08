# Database Migration

1. Back up the Supabase project.
2. Run `supabase-migrations.sql` in the Supabase SQL editor.
3. Confirm RLS is enabled and test student/admin sessions.
4. Set `RESEND_API_KEY`, `EMAIL_FROM`, and `CRON_SECRET` before scheduling notifications.
5. Roll back by restoring the backup; the migration uses additive tables, columns, indexes, views, and policies.
