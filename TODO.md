# TODO - Setup Tasks

> Complete these tasks to get the app running

---

## 1. Database Setup (Supabase)
- [ ] Go to https://supabase.com/dashboard
- [ ] Create a new project (or use existing)
- [ ] Go to **Settings → Database → Connection string** (URI format)
- [ ] Copy the **Session mode** connection string (port `5432`) for migrations
- [ ] Copy the **Transaction mode** connection string (port `6543`) for app runtime
- [ ] Paste into `.env` file as `DATABASE_URL` (use transaction mode `6543` for the app)
- [ ] Add a second variable `DIRECT_URL` with the session mode string (port `5432`) for migrations

## 2. Google OAuth Setup
- [ ] Go to https://console.cloud.google.com
- [ ] Create new project or select existing
- [ ] Go to "APIs & Services" → "Credentials"
- [ ] Click "Create Credentials" → "OAuth 2.0 Client IDs"
- [ ] Application type: "Web application"
- [ ] Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
- [ ] Copy Client ID → paste in `.env` as `GOOGLE_CLIENT_ID`
- [ ] Copy Client Secret → paste in `.env` as `GOOGLE_CLIENT_SECRET`

## 3. Generate Auth Secret
- [ ] Run in terminal: `openssl rand -base64 32`
- [ ] Copy output → paste in `.env` as `NEXTAUTH_SECRET`

## 4. Final .env File Should Look Like:
```env
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 5. Run Migrations
```bash
cd C:\Users\prabh\Desktop\popup-tool
npx prisma db push
```

## 6. Start Development Server
```bash
npm run dev
```

## 7. Test the App
- [ ] Open http://localhost:3000
- [ ] Click "Login with Google"
- [ ] Should redirect to dashboard
- [ ] Try adding a website

---

## Quick Links
- Supabase Dashboard: https://supabase.com/dashboard
- Google Cloud Console: https://console.cloud.google.com/apis/credentials
- Prisma Studio (view DB): `npx prisma studio`

---

## Remaining Build Tasks (Claude will handle)
- [ ] Razorpay subscription integration
- [ ] Billing page (plan display, upgrade/downgrade)
- [ ] Plan enforcement (80% warn, 120% stop)
- [ ] WhatsApp click-to-chat popup type
- [ ] WhatsApp number collection in popups
- [ ] Email collection + CSV export
- [ ] Webhook for lead notifications
- [ ] User onboarding flow
- [ ] Settings page
- [ ] Script minification (<5KB)
- [ ] Security review
- [ ] Rate limiting (Upstash Redis)
