# scene.

`scene.` is a marketplace and ticketing MVP for discovering local events in India and helping small organisers publish plans, sell tickets, and check in attendees.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without Supabase variables, the app runs in a local demo mode. When the Supabase variables and migration are configured, events, saved plans, bookings, published organiser events, and check-ins use shared Supabase data.

## Verify locally

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Deploy to Vercel

### Option A: GitHub + Vercel dashboard

1. Create an empty GitHub repository.
2. From this directory, commit and push the project:

   ```bash
   git init
   git add .
   git commit -m "Build scene event marketplace"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```

3. Go to [vercel.com/new](https://vercel.com/new).
4. Import the GitHub repository.
5. Keep the detected defaults:
   - Framework: `Next.js`
   - Install command: `npm install`
   - Build command: `npm run build`
6. Click **Deploy**.

Every push to `main` will create a new production deployment. Pull requests can create preview deployments.

## Connect Supabase (Step 3)

The repository includes the database migration at:

```text
supabase/migrations/20261017000000_scene.sql
```

### Create the hosted project

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Open **Project Settings → API**.
3. Copy the project URL and the publishable/anon key.
4. Add them to `.env.local` locally:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
   ```

5. Apply the migration. The CLI must be authenticated and linked to the project:

   ```bash
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npm run db:push
   ```

   The migration creates `events`, `saved_events`, and `bookings`, seeds the sample events, enables Row Level Security, and adds secure booking, availability, and check-in functions.

6. In Supabase **Authentication → URL Configuration**, set:
   - Site URL: your Vercel production URL
   - Redirect URL: `https://YOUR_VERCEL_DOMAIN/auth/confirm`
   - Local redirect URL: `http://localhost:3000/auth/confirm`

7. Add the same public variables to Vercel under **Settings → Environment Variables** for Production, Preview, and Development, then redeploy.

When Supabase is configured, discovery remains public. Saving events, booking, publishing, viewing tickets, and checking in attendees require an account. Payment collection is intentionally not included yet; bookings are persisted reservations.

### Option B: Vercel CLI

After installing the Vercel CLI and signing in:

```bash
npm i -g vercel
vercel login
vercel
```

Follow the prompts, then deploy production with:

```bash
vercel --prod
```

## Custom domain

After deployment, open the Vercel project and go to **Settings → Domains**. Add your domain and follow the DNS instructions.

## Environment variables

Supabase is scaffolded and the client switches to shared mode when these variables are configured:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

Do not commit `.env.local`, private API keys, payment secrets, or webhook secrets.

## Local fallback

The app intentionally keeps a local fallback so it can still be previewed before a Supabase project is connected. Do not use local fallback mode for real ticket sales.
