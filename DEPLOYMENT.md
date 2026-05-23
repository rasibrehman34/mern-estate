# Deployment Guide — MERN Estate on Vercel

This project deploys as a **monorepo on Vercel**: the React app is served as static files, and the Express API runs as a single serverless function at `/api/*`.

---

## Prerequisites

- [GitHub](https://github.com) account with this repo pushed
- [Vercel](https://vercel.com) account (free tier works)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- [Cloudinary](https://cloudinary.com) account (image uploads)
- [Firebase](https://console.firebase.google.com) project (Google OAuth)

---

## Project layout (deployment-relevant)

```text
mern-estate/
├── api/
│   ├── index.js          # Vercel serverless entry (exports Express app)
│   ├── server.js         # Local dev only (uses .listen)
│   ├── app.js            # Express configuration
│   ├── config/db.js      # Cached MongoDB connection
│   ├── routes/
│   ├── controllers/
│   └── models/
├── client/               # React + Vite frontend
├── vercel.json           # Vercel build & routing
└── .env.example          # Template for all env vars
```

---

## 1. Local setup

### 1.1 Environment files

**Root** (backend — copy from example):

```bash
cp .env.example .env
```

Fill in at minimum:

| Variable | Example (redacted) |
|----------|-------------------|
| `MONGO` | `mongodb+srv://user:****@cluster0.xxxxx.mongodb.net/mern-estate` |
| `JWT_SECRET` | `a-long-random-string-at-least-32-chars` |
| `CLOUDINARY_CLOUD_NAME` | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | `123456789012345` |
| `CLOUDINARY_API_SECRET` | `***************************` |
| `CLIENT_URL` | `http://localhost:5173` |

**Client** (`client/.env` — Vite only reads `VITE_*`):

```env
VITE_FIREBASE_API_KEY=AIzaSy...
```

Optional (usually leave empty for same-origin deploy):

```env
VITE_API_URL=
VITE_DEV_API_URL=http://localhost:3000
```

### 1.2 Install & run

```bash
npm install
npm install --prefix client
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3000 |
| Health check | http://localhost:3000/api/health |

Vite proxies `/api` → `localhost:3000` in development.

### 1.3 Production build (local check)

```bash
npm run build
```

Output: `client/dist/`

---

## 2. MongoDB Atlas

1. Create a cluster (free M0 is fine).
2. **Database Access** → create a DB user with password.
3. **Network Access** → add `0.0.0.0/0` (allow from anywhere) so Vercel serverless can connect.  
   For stricter security, use [Vercel's IP documentation](https://vercel.com/docs/security/deployment-protection) later.
4. **Connect** → Drivers → copy the connection string.
5. Replace `<password>` and set the database name in the URI:

   ```text
   mongodb+srv://myuser:MY_PASSWORD@cluster0.xxxxx.mongodb.net/mern-estate?retryWrites=true&w=majority
   ```

Use this value for `MONGO` in Vercel and in root `.env`.

---

## 3. Deploy to Vercel (step-by-step)

### Step 1 — Import project

1. Go to [vercel.com/new](https://vercel.com/new).
2. Import your GitHub repository (`mern-estate`).
3. **Root Directory:** leave as `.` (repository root). Do **not** set root to `client`.

### Step 2 — Build settings

Vercel should auto-detect settings from `vercel.json`:

| Setting | Value |
|---------|--------|
| Framework Preset | Other |
| Build Command | `npm run build` |
| Output Directory | `client/dist` |
| Install Command | `npm install && npm install --prefix client` |

If anything differs, override to match the table above.

### Step 3 — Environment variables

In **Project → Settings → Environment Variables**, add:

#### Server (all environments: Production, Preview, Development)

| Name | Value | Notes |
|------|--------|--------|
| `MONGO` | `mongodb+srv://...` | Atlas connection string |
| `JWT_SECRET` | *(long random string)* | Never commit to git |
| `CLOUDINARY_CLOUD_NAME` | from Cloudinary dashboard | |
| `CLOUDINARY_API_KEY` | from Cloudinary dashboard | |
| `CLOUDINARY_API_SECRET` | from Cloudinary dashboard | |
| `NODE_ENV` | `production` | Production only |
| `CLIENT_URL` | `https://your-app.vercel.app` | Your production URL (no trailing slash) |

#### Client (required at **build** time)

| Name | Value | Notes |
|------|--------|--------|
| `VITE_FIREBASE_API_KEY` | from Firebase console | Exposed to browser — restrict key in Firebase |

#### Optional

| Name | Value | When to use |
|------|--------|-------------|
| `VITE_API_URL` | *(leave empty)* | Same Vercel domain — recommended |
| `VITE_API_URL` | `https://other-api.com` | Only if API is on a different domain |

**After first deploy**, update `CLIENT_URL` to your real URL (e.g. `https://mern-estate.vercel.app`) and redeploy if you used a placeholder.

### Step 4 — Firebase (Google sign-in)

1. Firebase Console → Project Settings → Your apps → Web app.
2. Copy **API key** → `VITE_FIREBASE_API_KEY` in Vercel.
3. **Authentication → Settings → Authorized domains** → add:
   - `your-app.vercel.app`
   - `*.vercel.app` (for preview deployments) if needed

### Step 5 — Deploy

Click **Deploy**. First build may take 2–4 minutes.

### Step 6 — Custom domain (optional)

Project → Settings → Domains → add your domain, then set:

```text
CLIENT_URL=https://yourdomain.com
```

Redeploy after changing `CLIENT_URL`.

---

## 4. Post-deploy verification

Replace `YOUR_APP` with your Vercel hostname.

| Check | URL / action | Expected |
|-------|----------------|----------|
| SPA home | `https://YOUR_APP.vercel.app/` | Home page loads |
| React Router | `https://YOUR_APP.vercel.app/about` | About page (refresh works) |
| API health | `https://YOUR_APP.vercel.app/api/health` | `{"success":true,"message":"API is healthy"}` |
| Listings | `https://YOUR_APP.vercel.app/api/listing/get?limit=1` | JSON array (may be `[]`) |
| Sign up | Use UI → Sign Up | User created in MongoDB |
| Sign in | Email/password | Cookie set, profile works |
| Google OAuth | Sign in with Google | Works if Firebase domains configured |
| Images | Create listing / profile avatar | Cloudinary upload works |

---

## 5. How routing works on Vercel

```text
Browser request
    │
    ├─ /api/*     ──► api/index.js (Express serverless)
    │
    └─ /*         ──► client/dist/index.html (React SPA)
```

- Frontend uses relative paths (`/api/...`) via `client/src/utils/api.js`.
- Cookies are `httpOnly`, `secure` in production, `sameSite: strict` on the same domain.

---

## 6. Troubleshooting

### Build fails: `@tailwindcss/vite` not found

Ensure `installCommand` installs both root and client:

```text
npm install && npm install --prefix client
```

### API returns 500 / MongoDB errors

- Confirm `MONGO` is set in Vercel (Production + Preview).
- Atlas **Network Access** allows connections from Vercel.
- Connection string has correct password and database name.

### CORS errors in browser

- Set `CLIENT_URL` to the exact origin users visit (scheme + host, no path).
- Example: `https://mern-estate.vercel.app` not `http://...`

### Sign-in works locally but not on Vercel

- `JWT_SECRET` must be set on Vercel.
- Check cookies in DevTools → Application → Cookies (should see `access_token` on your domain).
- `CLIENT_URL` must match the site URL.

### Google OAuth fails

- Add production domain to Firebase **Authorized domains**.
- `VITE_FIREBASE_API_KEY` must be set before build (redeploy after adding).

### React Router 404 on refresh

- Confirm `vercel.json` rewrite to `/index.html` is present and `outputDirectory` is `client/dist`.

### Function timeout

- Large image uploads may be slow; `maxDuration` is 30s in `vercel.json`.
- Optimize image size on the client before upload.

---

## 7. Redeploying

- **Git push** to connected branch → automatic deployment.
- **Env change** → Vercel dashboard → redeploy latest deployment (env vars apply on next build for `VITE_*`).

```bash
# Or use Vercel CLI
npm i -g vercel
vercel          # preview
vercel --prod   # production
```

---

## 8. Security checklist

- [ ] `.env` and `client/.env` are in `.gitignore` (never commit secrets)
- [ ] `JWT_SECRET` is strong and unique per environment
- [ ] MongoDB user has least-privilege (not Atlas admin)
- [ ] Firebase API key restricted by HTTP referrer (production domain)
- [ ] Cloudinary upload presets/folders scoped as needed
- [ ] Rotate secrets if they were ever committed to git

---

## 9. Quick reference — npm scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | API + client together |
| `npm run dev:server` | API only (port 3000) |
| `npm run dev:client` | Vite only (port 5173) |
| `npm run build` | Build frontend for production |
| `npm start` | Run API locally (no Vite) |

---

## Support

If deployment fails, check **Vercel → Deployments → [latest] → Build Logs** and **Function Logs** for the `/api` route.
