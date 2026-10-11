# scene.

`scene.` is a marketplace and ticketing MVP for discovering local events in India and helping small organisers publish plans, sell tickets, and check in attendees.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The current public-demo experience works without environment variables. Events, saved plans, bookings, published organiser events, and check-ins are stored in the browser using `localStorage`.

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

Supabase is already scaffolded for the next product phase. When real shared accounts and data are added, configure these variables in Vercel under **Settings → Environment Variables**:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

Do not commit `.env.local`, private API keys, payment secrets, or webhook secrets.

## Next product phase

The public demo currently uses browser storage. The next backend milestone is to move events, users, bookings, organiser dashboards, and check-ins to Supabase so all visitors share the same data.
