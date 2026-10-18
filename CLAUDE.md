# FUE Malaysia — continue in Claude

This folder is the main website **and** the clinic admin demo (the project from 8 Oct).

## Singapore ads landing (added 9 Oct)

Salim asked for the Singapore ads landing page to live in this same admin as the main site.

- Public page: `/hair-transplant-singapore` (also `/hair-transplant-singapore.html`)
- Admin label: **Singapore ads landing**
- Template: `templates/hair-transplant-singapore.html`
- Pictures: `public/images/sg-*.webp` (shown on the Pictures tab)
- CSS/JS: `public/css/hair-transplant-singapore.css`, `public/js/hair-transplant-singapore.js`

A standalone copy also sits on the Desktop:

- Folder: `/Users/alexandreaasagi/Desktop/fue-sg-ads-landing`
- Zip: `/Users/alexandreaasagi/Desktop/fue-sg-ads-landing.zip`

## Malaysia ads landing (added 9 Oct)

Salim asked for the Malaysia ads landing page to live in this same admin as the main site and the Singapore ads landing.

- Public page: `/best-hair-transplant-in-malaysia` (also `/best-hair-transplant-in-malaysia.html`)
- Admin label: **Malaysia ads landing**
- Template: `templates/best-hair-transplant-in-malaysia.html`
- Pictures: `public/images/my-*.webp` (shown on the Pictures tab)
- CSS/JS: `public/css/hair-transplant-malaysia.css`, `public/js/hair-transplant-malaysia.js`

A standalone copy also sits on the Desktop:

- Folder: `/Users/alexandreaasagi/Desktop/fue-my-ads-landing`
- Zip: `/Users/alexandreaasagi/Desktop/fue-my-ads-landing.zip`

## Preview

```bash
npm run dev
```

- Main site: http://localhost:3000/
- Singapore ads landing: http://localhost:3000/hair-transplant-singapore
- Malaysia ads landing: http://localhost:3000/best-hair-transplant-in-malaysia
- Admin: http://localhost:3000/admin  (setup code: `dev-setup`)

Do not invent photos, prices, or medical wording. Keep the Singapore ads page price as **From SGD 4,999** and the Malaysia ads page price as **From RM 8,999** unless Salim changes them. The Malaysia ads page has no year-end promo popup.

## Tanam Rambut Malaysia (added 9 Oct, replaced with the finished site 18 Oct)

The second clinic website (tanamrambutmalaysia.com, Bahasa Malaysia only) is edited from this same admin.

- Public pages: `/tanam-rambut`, `/tanam-rambut/cara-ia-dilakukan`, `/tanam-rambut/doktor`, `/tanam-rambut/hasil`, `/tanam-rambut/hubungi`, `/tanam-rambut/rawatan`, `/tanam-rambut/privasi`, `/tanam-rambut/terma`, `/tanam-rambut/terima-kasih`
- Thank-you page: the Hubungi form opens WhatsApp with the visitor's details, then goes to `/tanam-rambut/terima-kasih` (noindex; greets them by name, shows their details, pushes the `thank_you_page` dataLayer event for Google Ads).
- Admin labels: **Tanam Rambut: Utama / Cara dilakukan / Doktor / Hasil / Hubungi / Rawatan / Dasar privasi / Terma penggunaan / Terima kasih**
- Templates: `templates/tr-*.html` (generated). Pictures: `public/images/tr-*.webp` (each one is a replaceable picture in the admin). CSS/JS: `public/tr/assets/` (3D particle heads: `woman.js`, `man.js`; three.js loads from cdnjs).
- Canonical URLs point at https://tanamrambutmalaysia.com. Tracking codes saved in the admin apply to every page of this project.
