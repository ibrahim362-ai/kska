# Marketing Site

Static landing page for Community Hub.

## Files

- `index.html` — single-page landing site
- `assets/` — images, icons (add your own)

## Deploy

### Option A: Static hosting (recommended)

Deploy to any static host:
- **Vercel** (free, fastest)
- **Netlify** (free)
- **GitHub Pages** (free)
- **Cloudflare Pages** (free)
- **AWS S3 + CloudFront**

### Option B: Via Nginx (with the rest of the app)

```nginx
server {
  listen 80;
  server_name communityhub.com www.communityhub.com;

  root /var/www/community-hub/marketing;
  index index.html;

  location / {
    try_files $uri $uri/ =404;
  }
}
```

### Option C: Vercel (one command)

```bash
npm i -g vercel
cd marketing
vercel --prod
```

## Customization

1. Replace placeholder stats (`10K+`, `500+`) with real numbers
2. Add your logo to `assets/logo.svg`
3. Add favicon (replace the inline SVG)
4. Update footer links to actual URLs
5. Replace `app.communityhub.com` and `admin.communityhub.com` with your domains
6. Add real testimonials (optional)
7. Add blog section (separate page or sub-route)

## SEO Checklist

- [x] Meta description
- [x] Open Graph tags
- [x] Semantic HTML
- [x] Mobile responsive
- [x] Fast loading (single HTML, no JS)
- [ ] Sitemap.xml
- [ ] robots.txt
- [ ] Google Search Console verification
- [ ] Structured data (Schema.org)
- [ ] Page speed optimization (already good — vanilla CSS)

## Analytics

Add before `</body>`:

```html
<!-- Plausible -->
<script defer data-domain="communityhub.com" src="https://plausible.io/js/script.js"></script>

<!-- Or Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXX');
</script>
```

## Performance

The page is:
- Single HTML file (~12KB)
- No JavaScript framework
- No external fonts (uses system font stack)
- Inline critical CSS
- Mobile-first responsive

Lighthouse score target: **95+** on all metrics.
