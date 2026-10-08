# Email Cron Setup

Set `RESEND_API_KEY`, `EMAIL_FROM`, and `CRON_SECRET` in the deployment environment. The notification endpoints accept `GET` requests with `Authorization: Bearer $CRON_SECRET`.

Schedule these routes once daily with Vercel Cron, GitHub Actions, or an external scheduler:

- `/api/notifications/send-reminders`
- `/api/notifications/send-overdue`

Keep the secret out of client code. Verify delivery in Resend logs and monitor the endpoint response for `processed` and `sent` counts.
