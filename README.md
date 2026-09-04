# AllioAI production setup (PostgreSQL + Render or Railway)

This project now uses PostgreSQL for users, sessions, conversations, and
messages. It uses Google Identity Services for sign-in and an HTTP-only cookie
for the login session.

## Before you start

You need:

- Node.js 20 or newer
- A Google account
- A PostgreSQL database from Render, Railway, Neon, or another trusted provider
- A GitHub repository if you want to deploy with Render or Railway

Never put a Google client secret, database password, or `SESSION_SECRET` in
frontend JavaScript.

## 1. Create a Google Client ID

1. Open <https://console.cloud.google.com/>.
2. Create a project named `AllioAI`.
3. Open **APIs & Services > OAuth consent screen**.
4. Choose **External**, enter the app name and support email, then save.
5. Open **Credentials > Create Credentials > OAuth client ID**.
6. Choose **Web application**.
7. Add your local origin:

   `http://localhost:3000`

8. After deployment, add your real website origin too, such as:

   `https://your-app.onrender.com`

9. Copy the Client ID. It ends with `apps.googleusercontent.com`.

Put this public ID in
`frontend/src/scripts/google-config.js`:

```javascript
window.ALLIOAI_CONFIG = {
  googleClientId: "YOUR_CLIENT_ID.apps.googleusercontent.com"
};
```

## 2. Create a PostgreSQL database

Create a PostgreSQL database in Render or Railway and copy its
`DATABASE_URL`. It looks similar to:

```text
postgresql://user:password@host:5432/database
```

The database must support the `pgcrypto` extension. Render and Railway
PostgreSQL databases normally do.

Run the SQL in `backend/schema.sql` once. You can use the provider's SQL
console, or the `psql` program:

```powershell
psql "YOUR_DATABASE_URL" -f C:\AllioAI\backend\schema.sql
```

The schema creates:

- `users` for Google users
- `sessions` for hashed login sessions
- `conversations` for each user's chats
- `messages` for each conversation's messages

## 3. Test production behavior locally

Create the backend environment file:

```powershell
cd C:\AllioAI\backend
Copy-Item .env.example .env
```

Open `backend/.env` and set real values:

```env
PORT=3000
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
DATABASE_URL=YOUR_DATABASE_URL
SESSION_SECRET=use-at-least-32-random-characters-here
NODE_ENV=development
SITE_URL=http://localhost:3000
DB_POOL_MAX=10
```

Generate a strong secret instead of using the example:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Install packages and start the server:

```powershell
npm.cmd install
npm.cmd start
```

Open:

`http://localhost:3000/signin.html`

Do not open the HTML file by double-clicking it. The backend must serve it so
the session cookie and API calls work.

Check the health endpoint:

`http://localhost:3000/api/health`

It should return:

```json
{"ok":true}
```

## 4. Deploy with Vercel

This repository includes `vercel.json` and `api/index.js`. In Vercel, import
the repository with the project root set to the repository root. Vercel will
run the Express app as a Node function and serve the frontend pages through
that function.

The repository root includes a build script. In Vercel, use:

```text
npm run build
```

Set the output directory to empty or leave it unset. Add all
variables from `backend/.env.example` in Vercel's Project Settings > Environment
Variables, using Production values. Do not upload `.env` files.

Run `backend/schema.sql` once against the production PostgreSQL database before
the first deployment. Serverless cold starts do not run schema migrations.

The clean routes are now:

- `/` — landing page
- `/app` — workspace
- `/signin` — sign in
- `/aboutus` — about page
- `/contact` — contact page
- `/privacy-policy` — privacy page
- `/tnc` — terms page

Requests for unknown paths return the branded 404 page.

## 5. Deploy with Render or Railway

1. Push the project to GitHub.
2. In Render, choose **New > Web Service**.
3. Select the repository.
4. Set the root directory to `backend`.
5. Set the build command to:

   `npm ci`

6. Set the start command to:

   `npm start`

7. Add these environment variables in Render:

   - `NODE_ENV=production`
   - `GOOGLE_CLIENT_ID=your Google client ID`
   - `DATABASE_URL=your PostgreSQL URL`
   - `SESSION_SECRET=your long random secret`
   - `SITE_URL=https://your-production-domain.example`
   - `DB_POOL_MAX=10`

8. Deploy and copy the public URL.
9. Add that exact HTTPS URL to Google's authorized JavaScript origins.
10. Test `https://your-domain/signin.html`.

### Setting `SITE_URL`

Set `SITE_URL` to the exact public origin, including `https://` and no trailing
slash. For example:

```env
SITE_URL=https://allioai.example.com
```

For local development:

```env
SITE_URL=http://localhost:3000
```

Add the same production origin to Google Cloud Console under **APIs &
Services > Credentials > OAuth 2.0 Client IDs > Authorized JavaScript origins**.
Also replace the placeholder domain in `frontend/src/pages/robots.txt` and
`frontend/src/pages/sitemap.xml` before publishing.

Railway uses the same commands and environment variables. Choose a Node
service, connect PostgreSQL, run `npm ci`, and start with `npm start`.

## How sign-in works

1. Google shows the sign-in button.
2. Google sends an ID token to `POST /api/auth/google`.
3. The backend verifies the token with Google's official library.
4. The backend creates or updates the user in PostgreSQL.
5. The backend stores only a hash of a random session token.
6. The browser receives an HTTP-only session cookie.
7. `app.html` calls the API with that cookie.
8. Every conversation query checks the signed-in user's database ID.

The browser never chooses which user it is. This prevents one user from
requesting another user's conversations.

## Important API endpoints

- `POST /api/auth/google` — verify Google sign-in and create a session
- `GET /api/auth/status` — check the current session
- `POST /api/auth/logout` — delete the current session
- `GET /api/conversations` — list only the signed-in user's conversations
- `POST /api/conversations` — create a conversation
- `GET /api/conversations/:id` — read an owned conversation and messages
- `POST /api/conversations/:id/messages` — save a message to an owned chat
- `GET /api/health` — database/server health check

## Production safety included

- PostgreSQL instead of a local JSON file
- Parameterized SQL queries
- HTTP-only, secure production cookies

## Production readiness checklist

Before deploying, confirm:

- `.env` files and `node_modules` are excluded from Git; never archive or commit secrets.
- Any previously exposed secret has been revoked and replaced.
- `SITE_URL` is the exact public HTTPS origin in production.
- `HTTP-Referer` sent to OpenRouter matches `SITE_URL`.
- Production environment variables are configured in the hosting provider.
- Google OAuth authorized JavaScript origins include the production origin.
- The app builds and starts successfully from a clean clone.
- The Express backend architecture matches the selected host (Render/Railway, or a Vercel-compatible API deployment).

Implemented locally:

- CSP and security headers through Helmet.
- OpenRouter request timeouts, usage limits, and session cleanup.
- `robots.txt` and `sitemap.xml` placeholders.
- Production dependency audit currently reports zero vulnerabilities.

Still provider/configuration dependent:

- Add Sentry or equivalent error monitoring.
- Configure automated PostgreSQL backups.
- Review and tighten CSP when all inline styles are removed.
- Move large uploads to object storage and process them asynchronously.
- Keep provider request timeouts and AI cost/usage limits enabled.
- Add automated unit, API, and end-to-end tests.
- Add complete SEO metadata, `robots.txt`, and a sitemap.
- Schedule cleanup of expired sessions with your database provider or a
  protected external cron job; Vercel functions are ephemeral.
- Hashed session tokens in the database
- Google ID-token verification
- Helmet security headers
- Request body size limits
- API rate limiting
- Same-origin checks for write requests
- User ownership checks on conversations
- Database foreign keys and indexes
- Graceful server shutdown

## Things you must still do before public launch

- Use a custom HTTPS domain.
- Add the production domain to Google OAuth settings.
- Keep all secrets in Render/Railway secret variables.
- Enable automated PostgreSQL backups.
- Set up uptime and error monitoring.
- Add account deletion and data export if required by your laws.
- Review the Terms and Privacy Policy with a qualified lawyer.
- Run `npm audit` and update dependencies regularly.
- Add an AI provider API and server-side response handling before calling this
  a complete chat product.

This is a production-oriented foundation, not a guarantee of legal compliance
or perfect security. Keep dependencies and infrastructure maintained.
