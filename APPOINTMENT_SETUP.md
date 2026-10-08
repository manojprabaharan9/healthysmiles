# Appointment form setup

The HealthySmiles appointment form now submits to `/api/appointment`.

## 1. Create the database

Create a Supabase project, open its SQL editor, and run the contents of `supabase.sql`.

The table uses Row Level Security with no public/browser policy. Appointment writes happen only from the Vercel serverless function using the Supabase service-role key.

## 2. Configure email

Create a Resend account/API key and verify the domain used by `RESEND_FROM_EMAIL`.

Use a sender such as:

`HealthySmiles <appointments@your-verified-domain.com>`

## 3. Add Vercel environment variables

Set these for the Production environment:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `CLINIC_EMAIL`

Never put the Supabase service-role key or Resend API key in `index.html` or any client-side JavaScript.

## 4. Behavior

The endpoint:
- accepts POST only
- validates name, phone, branch, and preferred date on the server
- rejects past dates
- includes a hidden honeypot field for basic bot filtering
- saves the request before sending the clinic notification
- records whether the notification was sent or failed
- returns a request ID after a successful submission
- does not expose database credentials to the browser

If the database save succeeds but email delivery fails, the patient is told that the request was saved but the clinic notification could not be sent, so the request is not silently lost.
