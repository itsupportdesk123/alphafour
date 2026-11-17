# Aurelia Residences



A luxury real-estate website with a scroll-driven 3D tower experience. It has two parts:

- a **React + Vite** front end, written in plain JavaScript;
- a small **Node.js / Express** API that sends enquiry, site-visit, call-back, feedback and newsletter emails through **SMTP** or **Microsoft 365**.

There is no database.

## Quick start

Requirements: Node.js 20.11 or newer (see `.nvmrc`) and npm.

```bash
npm run install:all                  # root, server and client dependencies
cp server/.env.example server/.env   # API settings (mail stays in preview mode by default)
cp client/.env.example client/.env   # optional: the defaults work locally
npm run dev                          # API and website together
```

| Service | URL |
| --- | --- |
| Website | http://localhost:5200 |
| API | http://localhost:4083/api (the website reaches it through Vite's `/api` proxy) |

The default `MAIL_PROVIDER=console` sends nothing. Each email is rendered, logged and saved as an HTML preview in `server/.mail-previews/`. See [Mail setup](#mail-setup) to send real emails.

## Scripts

Run these from the repository root:

| Command | What it does |
| --- | --- |
| `npm run install:all` | Installs root, `server/` and `client/` dependencies |
| `npm run dev` | Runs the API (`node --watch`) and the Vite dev server together |
| `npm run build` | Builds the website into `client/dist` and regenerates `sitemap.xml` and `robots.txt` first |
| `npm start` | Starts the API |
| `npm test` | Runs the API tests (Node test runner + Supertest) |
| `npm run lint` | Lints the server and the client |
| `npm run assets:fetch` | Downloads the CC0 panoramas, skies, HDRI and cloud sprite (`-- --force` re-downloads them) |

To check a production build of the website locally, run `npm --prefix client run preview` and open http://localhost:4173.

## Project structure

```text
.
├── client/                      React website (Vite, Tailwind CSS, Three.js)
│   ├── public/                  Intro film, panoramas, skies, HDRI, hero posters, OG image, manifest, sitemap
│   ├── scripts/                 generate-sitemap.mjs (runs before every build)
│   └── src/
│       ├── config/site.js       Brand, contact details, offices, social links, RERA, navigation
│       ├── data/                Residences, amenities, testimonials, gallery, floor plans, tour, FAQs …
│       ├── features/hero/       The 3D scroll story: heroConfig.js drives it, canvas/ renders it
│       ├── features/            Residences, virtual tour, gallery, map, EMI, floor plans, testimonials
│       ├── components/          ui/ (Radix primitives), common/, effects/, forms/, layout/
│       ├── pages/               One file per route
│       └── services/api.js      Calls to the mail API
├── server/                      Express API: mail and feedback only
│   ├── src/
│   │   ├── routes/              URL → rate limit → validation → controller
│   │   ├── controllers/         HTTP in and out, nothing else
│   │   ├── services/            Business rules: what to send, to whom, references, calendar invites
│   │   ├── repositories/        Mail transport (console | smtp | office365) and email templates
│   │   ├── templates/           Handlebars emails (layout, partials, one file per email)
│   │   ├── validators/          zod schemas for every form
│   │   ├── middlewares/         Request id, validation, rate limits, 404 and error handling
│   │   ├── config/              env.js (validated settings) and mail.config.js
│   │   ├── container.js         Wires repositories → services → controllers
│   │   └── app.js, server.js
│   └── tests/
├── scripts/fetch-assets.mjs     Downloads and converts the CC0 3D media
└── render.yaml                  Render blueprint for the API
```

## The API

The backend has three layers: controller, service and repository.

```text
request → route (rate limit + zod validation) → controller → service → repository → provider
                                                    │            │          ├ MailRepository → console | smtp | office365
                                                    │            │          └ TemplateRepository → Handlebars files
                                                    └ JSON: { success, message, data, requestId }
```

- **Controllers** turn HTTP requests into service calls and service results into responses. They hold no business logic.
- **Services** decide what happens. They:
  - create a reference number (`AUR-…` for leads, `FDB-…` for feedback);
  - notify the sales team;
  - queue the visitor's confirmation, with an `.ics` calendar invite for site visits.
- **Repositories** do the I/O. `MailRepository` delivers through the configured provider and `TemplateRepository` renders the emails. Moving from SMTP to Microsoft 365, or adding another provider later, only touches this layer.
- **`container.js`** wires everything together with plain dependency injection, so tests can swap in an in-memory mail provider.

### Endpoints

| Method | Path | What it does |
| --- | --- | --- |
| GET | `/api/health` | Service status and mail transport status |
| POST | `/api/enquiries` | Enquiry: team notification + confirmation to the visitor |
| POST | `/api/enquiries/site-visit` | Visit booking (date within 60 days, slots 10:00–17:00 IST): team + confirmation with a calendar invite |
| POST | `/api/enquiries/callback` | Call-back (`asap`, `morning`, `afternoon` or `evening`): team, plus a confirmation if an email is given |
| POST | `/api/feedback` | Feedback with a 1–5 rating. Low ratings are flagged for follow-up and anonymous feedback is allowed: team, plus thanks if an email is given |
| POST | `/api/newsletter/subscribe` | Sign-up: team + welcome email |

```bash
curl -X POST http://localhost:4083/api/enquiries \
  -H "Content-Type: application/json" \
  -d '{"name":"Aarav Mehta","email":"aarav@example.com","phone":"+91 98200 12345","message":"I would like details of the sea-facing 4 BHK residences.","consent":true}'
```

**Delivery**

- The team notification is sent before the API responds. If it still fails after three attempts with backoff, the API returns `503` and the website asks the visitor to try again or call. A lead is never lost silently.
- The visitor's confirmation goes through a background queue with the same retries, so a slow mail server never holds up the form.

**Protection**

- **Validation:** every field is checked with zod and cleaned of HTML.
- **Honeypot:** each form has a hidden `company` field. A submission that fills it gets a normal-looking reply, but no email is sent.
- **Rate limits:** `FORM_RATE_LIMIT_MAX` form posts and `RATE_LIMIT_MAX` requests per IP per `RATE_LIMIT_WINDOW_MIN` minutes. The defaults are 10, 200 and 15.
- **Headers:** Helmet, CORS, compression and request ids on every response.

## Mail setup

Choose the provider with `MAIL_PROVIDER` in `server/.env`. Every setting is documented in `server/.env.example`. On startup the API checks the mail connection and logs a warning if it fails rather than crashing. `GET /api/health` reports the transport status.

### Who receives each email

Every form on the website sends two emails:

| Email | Sent to | Contents |
| --- | --- | --- |
| Admin notification | `MAIL_TEAM_TO` (plus `MAIL_TEAM_CC`) | Every field on the form. Fields the visitor left blank read *Not provided*. Also the consent, the page it came from, the time (IST) and quick reply, call and WhatsApp buttons. Reply-To is the visitor. |
| Visitor copy | The email address entered in the form | *Your submission details*: the fields they filled in, plus their message and the next steps. |

The call-back and feedback forms make the email optional. Without one, only the admin is notified.

The admin inbox is a setting, so moving it needs no code change. Testing uses Gmail (`MAIL_TEAM_TO=it.support.enexio@gmail.com` with the `smtp` provider). To go live on Microsoft 365, follow the *Switching to Microsoft 365* checklist in `server/.env.example`; it sets `sales@alpha4infra.com` as sender and admin. `BRAND_EMAIL` keeps the public contact address in email footers, whichever mailbox sends.

### Development: `console`

This is the default. Emails are rendered exactly as they would be sent, logged, and written to `server/.mail-previews/*.html`. Open these files in a browser to check the design.

### Any SMTP server: `smtp`

```env
MAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false            # true for port 465
SMTP_USER=you@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM_ADDRESS=you@gmail.com
MAIL_TEAM_TO=sales@yourdomain.com
```

Gmail and Google Workspace accounts need an App Password, which requires 2-Step Verification. For higher volumes, use a transactional service such as Amazon SES, Zoho ZeptoMail, Brevo or SendGrid. They all accept SMTP.

### Microsoft 365: `office365`

This provider connects to `smtp.office365.com:587` with STARTTLS (TLS 1.2 or later). It has two sign-in modes.

**OAuth2 (recommended).** An Entra ID app sends as a mailbox, and no user password is stored.

1. In the **Entra admin center**, open **App registrations → New registration** (single tenant). Note the *Application (client) ID* and the *Directory (tenant) ID*.
2. Go to **Certificates & secrets → New client secret** and copy the secret's *value*.
3. Go to **API permissions → Add a permission → APIs my organization uses → Office 365 Exchange Online → Application permissions** and add **`SMTP.SendAsApp`**. Then click **Grant admin consent**.
4. Register the app in Exchange Online and give it access to the sending mailbox. Run the following in Exchange Online PowerShell. Use the object ID shown under **Enterprise applications**, not the one under App registrations.

   ```powershell
   Connect-ExchangeOnline
   New-ServicePrincipal -AppId <client-id> -ObjectId <enterprise-app-object-id>
   Add-MailboxPermission -Identity concierge@yourdomain.com -User <enterprise-app-object-id> -AccessRights FullAccess
   Set-CASMailbox -Identity concierge@yourdomain.com -SmtpClientAuthenticationDisabled $false
   ```

5. Configure the API:

   ```env
   MAIL_PROVIDER=office365
   MS365_AUTH=oauth2
   MS365_TENANT_ID=<tenant-id>
   MS365_CLIENT_ID=<client-id>
   MS365_CLIENT_SECRET=<secret-value>
   MS365_SENDER=concierge@yourdomain.com
   MAIL_FROM_ADDRESS=concierge@yourdomain.com
   ```

The API gets tokens with the MSAL client-credentials flow, caches them, and refreshes them five minutes before they expire. In OAuth2 mode the From address is always `MS365_SENDER`; the display name from `MAIL_FROM_NAME` is kept.

**Password (SMTP AUTH with Basic authentication).** Set `MS365_AUTH=password` with `MS365_USER` and `MS365_PASSWORD`.

- Authenticated SMTP must be enabled for the mailbox.
- Accounts protected by MFA or Security Defaults can't use this mode.
- Microsoft has announced that Basic authentication for SMTP AUTH in Exchange Online is being retired. Treat this mode as a stop-gap and move to OAuth2.

**Deliverability.** With any provider, publish SPF, DKIM and DMARC records for the sending domain. Otherwise confirmations can end up in spam.

## The website

**Stack**

- React 18 and React Router 6 with lazy-loaded routes, built with Vite 6.
- Tailwind CSS 3 with cream, gold, royal-blue and navy design tokens, in light and dark themes.
- Three.js through React Three Fiber, drei and postprocessing.
- GSAP ScrollTrigger with Lenis smooth scrolling, and Framer Motion.
- Radix UI, react-hook-form with zod, and Embla carousels.
- Photo Sphere Viewer, Leaflet and yet-another-react-lightbox.

| Route | Page |
| --- | --- |
| `/` | 3D hero story, introduction, stats, featured residences, 360° tour, amenities, gallery, location, testimonials, EMI calculator, partners, site-visit booking |
| `/residences` | Search and filters (city, type, budget, BHK, status) kept in the URL; grid, list and map views; saved favourites |
| `/residences/:slug` | Photo mosaic, overview, 360° tour, floor plans, amenities, cost sheet and EMI, location and landmarks, enquiry card, similar homes |
| `/residences/:slug/brochure` | Printable brochure, unlocked with a short form |
| `/virtual-tour` | Seven linked 360° scenes with hotspots, autorotate and gyroscope control |
| `/gallery` | Filterable masonry gallery with a zoomable lightbox |
| `/about` | Story, values, milestones, private client team |
| `/contact` | Enquiry, site-visit, call-back and feedback forms (`?tab=enquiry`, `visit`, `callback` or `feedback`), offices and map |
| `/privacy` | Privacy policy |

### Company intro film

When a visitor enters the site, the AlphaFour intro film plays full-screen. It lasts about 7 seconds, then fades into the page. **Skip intro** or Escape goes straight to the site, and **Play intro film** in the footer plays it again.

- **When it plays:** once per browser tab by default. Set `VITE_INTRO_MODE` to `always`, `once` (first visit only) or `off` to change that. Add `?intro=1` to any URL to force it, which is handy for testing, or `?intro=0` to skip it.
- **When it doesn't:** visitors with *reduce motion* or Data Saver turned on, and automated browsers and crawlers, go straight to the site.
- **Loading:** `index.html` paints the film's first frame before any JavaScript loads, so the page never flashes first. The 3D hero waits for the film to end, so the two don't compete for bandwidth.
- **Files:** `client/public/videos/` holds a 1080p encode for desktops and tablets (3.3 MB), a 720p encode for phones (1.4 MB) and a poster, which is the film's first frame. They are web encodes of `client/public/assets/AlphaFourIntroVideo.mp4` (7.8 MB, whose audio track is silent). The original file is untouched.

To use a different 16:9 film, re-encode it with [ffmpeg](https://ffmpeg.org) and keep the file names. If you rename them, also update `client/src/features/intro/introConfig.js` and the poster path in `client/index.html`.

```bash
ffmpeg -i NewFilm.mp4 -an -c:v libx264 -preset slow -crf 23 -profile:v high -pix_fmt yuv420p -vf scale=1920:1080 -movflags +faststart client/public/videos/alphafour-intro-1080.mp4
ffmpeg -i NewFilm.mp4 -an -c:v libx264 -preset slow -crf 24 -profile:v high -pix_fmt yuv420p -vf scale=1280:720 -movflags +faststart client/public/videos/alphafour-intro-720.mp4
ffmpeg -i client/public/videos/alphafour-intro-1080.mp4 -frames:v 1 -c:v libwebp -quality 80 client/public/videos/alphafour-intro-poster.webp
```

- `-movflags +faststart` puts the file's index at the front, so playback can start before the whole file arrives.
- `-an` drops the audio. Browsers only autoplay video muted, so the intro has no sound button; a film with sound would need one added.
- Returning visitors may see the previous film for up to 7 days, the cache time set in `client/vercel.json`.

### The 3D hero

The home page opens with a pinned scroll story about seven screens long. It has six chapters:

1. The eagle view.
2. The façade.
3. The grand lobby, shown as a 360° atrium.
4. The glass lift.
5. The signature residence, a 360° living room with hotspots. Visitors can drag it or turn it with their phone's gyroscope.
6. The rooftop at dusk, with the infinity pool and the helipad.

`client/src/features/hero/heroConfig.js` holds the chapter copy, timings, floor labels, hotspots and swappable assets.

**Performance and fallbacks**

- **Loading:** the 3D canvas loads once the page is idle. A pre-rendered poster of the first frame (`client/public/images/hero-poster*.webp`) shows until then, and the canvas fades in over it once its first complete frame is ready.
- **Quality:** the tier (low, medium or high) controls shadows, bloom, city size and pixel ratio. It is chosen from the device and adjusted live from the frame rate. `VITE_HERO_QUALITY` pins it to one tier.
- **Fallback:** visitors who have *reduce motion* turned on, or whose browser lacks WebGL 2, get a still hero that tells the same story. `VITE_HERO_MODE=static` forces it for everyone.
- **Off screen:** rendering stops while the hero is scrolled out of view.

**Customising the scene**

- **Your own tower model.** Export a Draco-compressed GLB at the scale of the built-in tower: about 22 × 16 units in plan and 120 units tall, centred on the origin with its base at `y = 0`. Put it in `client/public/models/` and set `HERO_ASSETS.towerModel`. The camera paths are in `canvas/paths.js`.
- **Interiors and skies.** Replace the 2:1 equirectangular WebP files in `client/public/panoramas/` and `client/public/skies/`, or point `HERO_ASSETS` at new files.
- **Posters.** If the scene changes, re-capture the first frame with the overlay hidden. Build with `VITE_HERO_QUALITY=high` so the render is consistent:
  - 2560 × 1080 for `hero-poster.webp`;
  - 1200 × 1600 for `hero-poster-portrait.webp`.

  On the home page, `index.html` preloads whichever poster matches the screen orientation.

### Content and branding

- **Contact details:** brand, phone, email, addresses, offices, social links and RERA details are in `client/src/config/site.js`. Emails use the `BRAND_*` settings in `server/.env`.
- **Content:** residences, amenities, testimonials, gallery, floor plans, virtual-tour scenes, FAQs, stats, landmarks and advisers are in `client/src/data/`.
- **Photos:** Unsplash ids in the `PHOTOS` map in `client/src/lib/media.js`.
- **Design tokens:** colours, fonts and the type scale are in `client/tailwind.config.js` and `client/src/styles/globals.css`.

### Adding 21st.dev or shadcn/ui components

`client/components.json` is set up for the shadcn CLI. It writes JavaScript (`"tsx": false`) and uses the `@/` aliases. The existing `ui/` components follow the same Radix + Tailwind + `cn()` conventions. To add a component from 21st.dev:

```bash
cd client
npx shadcn@latest add "https://21st.dev/r/<author>/<component>"
```

## Environment variables

### Server (`server/.env`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `4083` | API port |
| `CLIENT_URL` | `http://localhost:5200` | Website URL used in email links |
| `CORS_ORIGINS` | `CLIENT_URL` | Comma-separated list of browser origins allowed to call the API |
| `TRUST_PROXY` | `1` | Number of reverse proxies in front of the API (keeps rate limits per visitor) |
| `RATE_LIMIT_WINDOW_MIN`, `RATE_LIMIT_MAX`, `FORM_RATE_LIMIT_MAX` | `15`, `200`, `10` | Rate limits |
| `MAIL_PROVIDER` | `console` | `console`, `smtp` or `office365` |
| `MAIL_FROM_NAME`, `MAIL_FROM_ADDRESS` | | Sender |
| `MAIL_TEAM_TO` | `MAIL_FROM_ADDRESS` | Admin inbox for every website submission (comma-separated, checked at startup) |
| `MAIL_TEAM_CC` | | Optional copies of the admin notification (comma-separated) |
| `MAIL_REPLY_TO` | `MAIL_FROM_ADDRESS` | Reply address on emails to visitors |
| `SMTP_*`, `MS365_*` | | Provider settings (see [Mail setup](#mail-setup)) |
| `BRAND_EMAIL` | `MAIL_FROM_ADDRESS` | Public contact address shown in email footers |
| `BRAND_*` | | Phone (plus optional `BRAND_PHONE_ALT`), WhatsApp, address and map link shown in emails |

### Client (`client/.env`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `/api` | In production, the API's public URL, for example `https://aurelia-api.onrender.com/api` |
| `VITE_SITE_URL` | `http://localhost:5200` | Public site URL used for canonical links, Open Graph tags and the sitemap |
| `VITE_WHATSAPP_NUMBER` | `919800000000` | Country code and number, digits only |
| `VITE_HERO_MODE` | `auto` | `static` forces the still hero |
| `VITE_HERO_QUALITY` | `auto` | `low`, `medium` or `high` pins the 3D quality |
| `VITE_INTRO_MODE` | `session` | When the intro film plays: `session` (once per browser tab), `always`, `once` (first visit only) or `off` |
| `VITE_MAP_TILE_URL`, `VITE_MAP_ATTRIBUTION` | OpenStreetMap | Map tile server and its attribution |
| `API_PROXY_TARGET` | `http://localhost:4083` | Development only: where Vite forwards `/api` |

`VITE_*` values are baked in when the site is built, so rebuild after changing them.

## Deployment

The website is static and the API is a small Node service. Host them separately as described below, or put both behind one reverse proxy.

### API on Render (or any Node host)

1. Push the repository to GitHub or GitLab.
2. In Render, choose **New → Blueprint** and pick the repository. `render.yaml` creates the `aurelia-api` web service from `server/`, with a health check on `/api/health`.
3. Fill in the secrets it asks for:
   - `CLIENT_URL` and `CORS_ORIGINS` (must include the website's domain);
   - sender and team addresses;
   - SMTP or Microsoft 365 credentials.

On other hosts (Railway, a VPS, Azure App Service), run `npm ci --omit=dev && npm start` in `server/` on Node 20 or later, with the same variables and `NODE_ENV=production`.

### Website on Vercel (or Netlify, Cloudflare Pages, S3)

1. Import the repository into Vercel and set **Root Directory** to `client`. `client/vercel.json` already configures the build, SPA rewrites, long-term caching and security headers.
2. Add these environment variables:
   - `VITE_API_URL=https://<your-api>/api`
   - `VITE_SITE_URL=https://<your-domain>`
   - the WhatsApp number and map tile settings.
3. Deploy, then add the website's domain to the API's `CORS_ORIGINS`.

On other static hosts, run `npm run build` and serve `client/dist/`. It is a single-page app, so unknown paths must be rewritten to `/index.html`.

### One server

To serve both from one domain, put the built site and the API behind Nginx (or similar). `VITE_API_URL` can then stay `/api`:

```nginx
location /api/ { proxy_pass http://127.0.0.1:4083; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; }
location /     { root /var/www/aurelia/client/dist; try_files $uri /index.html; }
```

## Before going live

- [ ] Replace the placeholder phone numbers, emails, addresses, offices, social links and RERA number in `client/src/config/site.js` and the `BRAND_*` settings in `server/.env`.
- [ ] Replace the sample residences, prices and Unsplash photos with the real project content, and check the RERA advertising disclaimers.
- [ ] Set `VITE_SITE_URL` to the real domain. Canonical URLs, Open Graph tags and `sitemap.xml` all use it.
- [ ] Switch the maps to a keyed tile provider (MapTiler, Stadia Maps, Mapbox …) with `VITE_MAP_TILE_URL`. OpenStreetMap's public tiles are only for light use.
- [ ] Set up real mail delivery and SPF, DKIM and DMARC, then send a test from every form.
- [ ] Have the privacy policy reviewed against India's DPDP Act 2023.
- [ ] Re-render the hero posters if the 3D scene changes.
- [ ] Remove files you don't use from `client/public/`. Everything in it is deployed; `client/public/assets/` currently holds about 77 MB, mostly videos.

## Testing

```bash
npm test        # API: routes, validation, honeypot, retries and failure handling, calendar invites, templates
npm run lint    # server and client
npm run build   # production build of the website
```

## Credits

- 360° interiors, sky domes and HDRI lighting: [Poly Haven](https://polyhaven.com) (CC0).
- Cloud sprite: [pmndrs/drei-assets](https://github.com/pmndrs/drei-assets).
- Placeholder photography: [Unsplash](https://unsplash.com) (Unsplash License).
- Map data: © OpenStreetMap contributors.
- Fonts: Cormorant Garamond and Manrope (SIL Open Font License), through Fontsource.
- Icons: [Lucide](https://lucide.dev) (ISC).
