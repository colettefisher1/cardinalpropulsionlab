# Cardinal Propulsion Lab website

A two-page public site plus a private CPL member schedule and administrator dashboard for **cardinalpropulsionlab.com**.

## Included

- Public **Our Work** page with embedded R.T. Finley / CPL test videos
- Public **Contact** page for Colette Fisher
- Passwordless Stanford-email login
- Private weekly member schedule
- Admin dashboard to add/delete schedule entries
- Weekly repeating schedule entries
- Member/admin allowlist
- Supabase Row Level Security so the schedule is not public
- CPL logo and responsive mobile styling

## Selected video archive

- Hyperion - A3 - Static Fire Test 2: https://www.youtube.com/watch?v=0SWINn8Ib4Q
- Nitrous/IPA Liquid Biprop: https://www.youtube.com/watch?v=UA2dw36aSKw
- EngineTests: https://www.youtube.com/watch?v=QMwNaVfAM0U
- Channel: https://www.youtube.com/@R.T.Finley/videos

## 1. Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

The public pages work immediately. Member login/scheduling requires Supabase configuration below.

## 2. Create the Supabase backend

1. Create a free Supabase project.
2. Open **SQL Editor** and run `supabase/schema.sql`.
3. In **Authentication > URL Configuration**, add your local and production URLs as allowed redirect URLs:
   - `http://localhost:3000/**`
   - `https://cardinalpropulsionlab.com/**`
   - your temporary Vercel URL while testing
4. Copy your project URL and anon key into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

The schema seeds **colettef@stanford.edu** as the first administrator. Colette can then add additional members/admins from `/admin`.

## 3. Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import that repository into Vercel.
3. Add the two Supabase environment variables in Vercel.
4. Deploy.
5. Add `cardinalpropulsionlab.com` under **Vercel > Project > Settings > Domains**.
6. Vercel will show the DNS records to add at Squarespace Domains.
7. In Squarespace Domains, update only the DNS records requested by Vercel. You can keep the domain registered at Squarespace.

## Access model

- Public visitors: Our Work + Contact only
- Allowlisted CPL members: private schedule
- Admins: schedule + member access management
- Merely having an `@stanford.edu` email does **not** grant access. The email must also be in `member_allowlist`.

## Before launch

Recommended final pass:

- Replace any placeholder copy with exact CPL project specs if desired.
- Add additional team social links.
- Add additional photos or CAD renders if available.
- Test magic-link email deliverability from Stanford accounts.
- Verify all schedule times appear correctly in Pacific Time for CPL members.
