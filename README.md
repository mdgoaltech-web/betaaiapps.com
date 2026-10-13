# betaaiapps.com — Beta AI Apps website

A fast, static corporate website: plain HTML, CSS and JavaScript with no framework, no build step,
no third-party scripts and no recurring costs. Upload the folder to any static host and it works.

```
index.html            Home: hero, About, Expertise, Approach, Contact (single page)
privacy.html          Privacy policy for the website and contact form
404.html              Not-found page
robots.txt            Allows indexing, points to the sitemap
sitemap.xml           Home + privacy
site.webmanifest      App name, colours and icons
favicon.ico           16/32/48 px favicon
CNAME, .nojekyll      For GitHub Pages (custom domain, serve files as-is)
_headers              Security + cache headers for Netlify / Cloudflare Pages
vercel.json           The same headers for Vercel
assets/css/styles.css All styles; brand colours and fonts are variables at the top
assets/js/main.js     Menu, scroll effects, contact form (no dependencies)
assets/fonts/         Manrope (self-hosted, 24 KB, SIL Open Font License)
assets/img/           Logo (logo.svg), favicon.svg, app icons, social share image (og-image.png)
```

## Before going live — what you need to do

1. **Email address.** The site uses `afex@betaaiapps.com` everywhere. To change it, search-and-replace it in
   `index.html`, `privacy.html` and `404.html` (it is also the `data-email` attribute on the form).

2. **Contact form delivery (5 minutes, free).** The form already works without this: it validates the
   message and then opens the visitor's email app with everything filled in. For messages to arrive
   directly without the visitor's email app:
   - Create a free form at [formspree.io](https://formspree.io) using your business email.
   - Copy the endpoint it gives you (looks like `https://formspree.io/f/abcdwxyz`).
   - In `index.html`, find `data-endpoint=""` on the `<form>` and paste it between the quotes.
   - Send yourself a test message from the live site and confirm Formspree's verification email.

   The page's security policy already allows `formspree.io` (and `formsubmit.co` as an alternative).
   If you choose another provider, add its domain to `connect-src` and `form-action` in the
   Content-Security-Policy `<meta>` tag in `index.html` (and in `_headers` / `vercel.json` if you use those hosts).

3. **Privacy policy.** `privacy.html` is a plain-English policy for a site that collects only contact-form
   messages. Have it reviewed for your jurisdiction if needed.

## Deploying to betaaiapps.com

### Option A — GitHub Pages (free, same setup as makaiapps.com)

1. Create a public repository (for example `betaaiapps.com`) and push the contents of this folder to the
   `main` branch (the files must be at the repository root, including `CNAME` and `.nojekyll`).
2. Repository → Settings → Pages → Source: *Deploy from a branch*, Branch: `main` / `(root)`.
3. Custom domain: `betaaiapps.com` (already set by the `CNAME` file).
4. At your domain registrar, set these DNS records:

   | Type  | Name | Value                    |
   |-------|------|--------------------------|
   | A     | @    | 185.199.108.153          |
   | A     | @    | 185.199.109.153          |
   | A     | @    | 185.199.110.153          |
   | A     | @    | 185.199.111.153          |
   | CNAME | www  | `<your-github-username>.github.io` |

   Remove any other A/AAAA records for `@` (for example the registrar's parking page).
5. Once DNS resolves (minutes to a few hours), GitHub issues the HTTPS certificate. Then tick
   **Enforce HTTPS** in Settings → Pages. `www` redirects to the bare domain automatically.

GitHub Pages ignores `_headers`; the important security policy is also set in each page's `<meta>` tag.

### Option B — Cloudflare Pages or Netlify (free, adds the full security headers)

Create a project, upload this folder (or connect the Git repository with no build command and output
directory `/`), then add `betaaiapps.com` and `www.betaaiapps.com` as custom domains and follow the DNS
records the host shows. HTTPS is automatic. `_headers` is applied automatically.

### Option C — Vercel

Run `vercel deploy --prod` from this folder, then add the domain under Project → Settings → Domains.
`vercel.json` supplies the headers.

### After deploying

- Submit `https://betaaiapps.com/sitemap.xml` in [Google Search Console](https://search.google.com/search-console)
  (verify the domain with a DNS TXT record).
- Paste `https://betaaiapps.com` into a social preview checker to see the share card.

### Updating the site later

Edit the files and redeploy. When you change `styles.css` or `main.js`, bump the `?v=` number on their
`<link>`/`<script>` tags in all three HTML pages so returning visitors get the new version immediately.

## Previewing locally

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080. Links use root paths like `/assets/...`, so open the site through a server
rather than double-clicking the file.

## Design notes

- **Brand:** the mark is a β drawn as a single continuous stroke on an app-icon tile, with a small spark —
  “beta” as in a product that keeps improving. Colours: midnight `#05060A` base and a cobalt→aqua gradient
  (`#8C9BFF` → `#35E0C9`) used sparingly for emphasis.
- **Type:** Manrope, self-hosted as one variable-weight file.
- **Motion:** CSS-only hero entrance, a drawn chart line in the phone mock-up, a scroll reveal, a pointer tilt
  on desktop, and the “product loop” sweep in Approach. All motion is switched off for visitors who set
  *reduce motion* in their operating system.
- **Honesty:** no portfolio, statistics, client logos or testimonials. The phone and pipeline visuals are
  decorative illustrations and are hidden from screen readers.

See `QA-REPORT.md` for the test results.
