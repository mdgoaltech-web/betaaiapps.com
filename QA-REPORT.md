# QA report — betaaiapps.com

Tested 13 October 2026 on a local server (`python3 -m http.server`), in Chromium at 1440×900, 1280×860,
768×1024 (tablet) and 375×812 (phone), plus Lighthouse 12.2.1 in headless Chrome.

## Summary

| Area | Result |
|---|---|
| Lighthouse, mobile | Performance 99 · Accessibility 100 · Best practices 100 · SEO 100 |
| Lighthouse, desktop | Performance 100 · Accessibility 100 · Best practices 100 · SEO 100 |
| Core Web Vitals (lab) | Mobile LCP 1.5 s, CLS 0, TBT 90 ms · Desktop LCP 0.4 s, CLS 0, TBT 0 ms |
| Page weight | About 45 KB gzipped for the first visit (HTML 8.6 KB, CSS 8.4 KB, JS 3.8 KB, font 24 KB). No images on the critical path. |
| Third-party requests | None (fonts self-hosted; no analytics, trackers or CDNs) |
| Horizontal overflow | None at 375, 768, 1280 or 1440 px (`scrollWidth === innerWidth`) |
| Console errors | None |
| Links, anchors and assets | All internal links, anchors and asset paths resolve; no duplicate ids |

Lighthouse's remaining notes are only “enable text compression” and “long cache lifetimes”. These come
from the bare local test server; GitHub Pages, Cloudflare Pages, Netlify and Vercel compress files and send
cache headers automatically (the cache rules are also in `_headers` / `vercel.json`).

## Functional checks

| Check | Result |
|---|---|
| Desktop nav links (About, Expertise, Approach, Contact) scroll to the right section, under the fixed header | Pass |
| Active-section highlight in the nav follows scrolling | Pass |
| Mobile menu opens and closes; focus moves into the menu and stays there; Escape closes it and returns focus to the button; page behind can't be scrolled or tabbed to | Pass |
| Tapping a menu link closes the menu and scrolls to the section | Pass |
| “Start a project”, “Explore our expertise”, footer links, email links, privacy link, 404 “Go to the homepage” | Pass |
| Form: submitting empty shows a message under each required field, a summary, and moves focus to the first problem | Pass |
| Form: invalid email is flagged when leaving the field; errors clear as you fix them | Pass |
| Form: character counter, service chips (mouse and keyboard), stage dropdown | Pass |
| Form with a backend set: shows “Sending…”, posts JSON with all fields, then shows the thank-you panel and moves focus to it | Pass (backend simulated) |
| Form with a failing backend: shows a clear error with the email address; button becomes usable again | Pass (tested against a real failing endpoint) |
| Form without a backend (as shipped): builds a `mailto:` link with the message filled in and shows a note with the email address | Pass (whether a mail app opens depends on the visitor's device) |
| “Send another message” resets the form | Pass |
| Spam protection: a filled honeypot field or a submit within 2.5 s of loading shows “thanks” and sends nothing | Pass (verified no request is made) |
| Privacy page and 404 page render and link back home | Pass |

## Bugs found during QA and fixed

1. **The form stayed visible under the thank-you message.** The form's `display: grid` overrode the
   `hidden` attribute. Fixed with a global `[hidden] { display: none !important }` rule.
2. **Blank gap under the contact form after scrolling to it.** Sections with `overflow: hidden` are
   scrollable by the browser (scrolling to a focused field can shift their contents). Decorative
   containers now use `overflow: clip`, which can't scroll.
3. **Loop diagram labels overlapped their dots.** A CSS `text-anchor` rule overrode the SVG attributes.
   Fixed, and the labels now light up exactly as the sweep passes them.
4. **Mobile menu was see-through** over the hero text. It now has a solid background.
5. **404 digits showed grey instead of the brand gradient** because of a more specific paragraph colour rule.
6. **Wordmark lost “AI Apps” on 375 px phones.** It now only shortens below 340 px.
7. **“Why Beta” card**: the large β glyph sat behind the paragraph and hurt readability. It is now a
   separate mark above the heading.
8. **Tablet grid** left the last expertise card alone on a row; it now spans the full width.

## Accessibility

- Semantic landmarks (`header`, `nav`, `main`, `section` with headings, `footer`), one `h1`, ordered headings.
- Skip link, visible focus rings, every control reachable and operable by keyboard.
- Form fields have labels; errors are linked with `aria-describedby` and marked `aria-invalid`; status
  messages are announced through a polite live region.
- Decorative visuals (phone mock-up, marquee, glows) are hidden from screen readers; the product loop
  diagram has a text alternative.
- Text contrast meets WCAG AA (Lighthouse contrast audit passed).
- All animation stops when the visitor has *reduce motion* enabled.

## Security

- Content-Security-Policy on every page: scripts, styles, fonts and images only from the site itself;
  form submissions only to the site, `mailto:`, Formspree or FormSubmit; no inline scripts; `object-src 'none'`.
- `_headers` / `vercel.json` add HSTS, `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `nosniff`,
  a strict referrer policy and a permissions policy (on hosts that support custom headers).
- Form input is trimmed, stripped of control characters and length-limited before sending; requests are sent
  without cookies (`credentials: "omit"`), with a 15-second timeout.
- No secrets or keys in the code. The Formspree endpoint, when added, is meant to be public.

## SEO

- Unique title and meta description per page, canonical URLs, `robots.txt`, `sitemap.xml`.
- Open Graph and Twitter card tags with a 1200×630 share image.
- Organization and WebSite structured data (JSON-LD).
- `noindex` on the 404 page.

## Not tested here (needs the live domain or real devices)

- HTTPS certificate, `www` → apex redirect and response headers on the real host (verify after DNS is set).
- Real email delivery through Formspree (needs your endpoint and inbox).
- Physical iPhone/Android devices and Safari/Firefox. Checks used Chromium's device emulation; the CSS uses
  well-supported features, with fallbacks where needed (`overflow: clip` → `hidden`, `100dvh` → `100vh`).
