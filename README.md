# please-fast-next

**Interactive CLI for generating customizable Next.js 16 projects.**

Build a production-ready Next.js starter in seconds — with TypeScript/JavaScript, Tailwind, Axios, SCSS, NProgress, i18n, and more.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Node](https://img.shields.io/badge/Node-18%2B-green?style=for-the-badge)
![NPM](https://img.shields.io/badge/NPM-please--fast--next-red?style=for-the-badge)

---

## Installation

```bash
npm install -g please-fast-next
```

or using npx (no install needed):

```bash
npx please-fast-next
```

---

## Usage

```bash
please-fast-next
```

The CLI will ask you a series of questions to configure your project:

1. **Project name**
2. **Language** — TypeScript (default) or JavaScript
3. **Axios** — HTTP client with interceptors, token refresh, js-cookie
4. **Tailwind CSS** — utility-first CSS framework
5. **SCSS** — Sass support with pre-configured variables and mixins
6. **NProgress** — route change progress bar
7. **Public folder structure** — `/public/assets` and `/public/icons`
8. **i18n** — full internationalization with `next-intl`

After generation:

```bash
cd my-app
npm run dev
```

---

## What it generates

Uses `create-next-app@16.2.2` under the hood with App Router enabled.

### Base setup

- Next.js 16 with App Router
- TypeScript or JavaScript
- Automatic cleanup of default files (Geist fonts, favicon, SVGs, globals.css, page.module.css)

### Axios (optional)

- `/api/axios.(ts|js)` — full axios instance with:
  - Request interceptor (auth token, locale header)
  - Response interceptor (401 token refresh, 429 retry)
  - `js-cookie` for token/locale management

### Tailwind CSS (optional)

- Configured via `create-next-app` flag

### SCSS (optional)

- `sass` package installed
- Pre-configured `globals.scss` with variables and mixins

### NProgress (optional)

- `/providers/Provider.(tsx|jsx)` — progress bar wrapper using `next-nprogress-bar`
- Auto-integrated into layout

### i18n (optional)

Full `next-intl` setup:

- `/i18n/routing.(ts|js)` — locale routing config (az, en, ru)
- `/i18n/navigation.(ts|js)` — `Link`, `useRouter`, `usePathname`, `isActive`, `useIsActive`
- `/i18n/request.(ts|js)` — server-side translation loading (uses axios if selected, otherwise `fetch`)
- `/app/[locale]/layout.(tsx|jsx)` — locale layout with Provider
- `/app/[locale]/page.(tsx|jsx)` — locale page
- `/app/[locale]/globals.(css|scss)` — global styles
- `proxy.(ts|js)` — Next.js 16 proxy file for i18n routing (replaces the old `middleware.ts`)
- `next.config.(ts|mjs)` automatically configured with `next-intl` plugin

### SVG support

- `@svgr/webpack` installed with turbopack and webpack config

---

## Generated folder structure

```
my-app/
├── app/
│   ├── layout.(tsx|jsx)            # Root layout (simplified if i18n)
│   └── [locale]/                   # (if i18n enabled)
│       ├── layout.(tsx|jsx)        # Locale layout with Provider
│       ├── page.(tsx|jsx)          # Locale page
│       └── globals.(css|scss)      # Global styles
├── api/                            # (if axios enabled)
│   └── axios.(ts|js)               # Axios instance with interceptors
├── providers/                      # (if nprogress or i18n enabled)
│   └── Provider.(tsx|jsx)          # NProgress provider
├── i18n/                           # (if i18n enabled)
│   ├── routing.(ts|js)
│   ├── navigation.(ts|js)
│   └── request.(ts|js)
├── public/
│   ├── assets/                     # (if public structure enabled)
│   └── icons/                      # (if public structure enabled)
├── proxy.(ts|js)                   # (if i18n enabled)
└── next.config.(ts|mjs)            # Auto-configured
```

---

## Config file handling

- **TypeScript projects** → `next.config.ts` with `import type { NextConfig }`
- **JavaScript projects** → `next.config.mjs` with JSDoc type annotation

When i18n is enabled, the config is automatically updated with the `next-intl` plugin.

---

## Notes

- All default Next.js boilerplate files are cleaned up (fonts, favicon, SVGs, CSS modules)
- If i18n is enabled, `app/page` is removed and `app/layout` is simplified to `<>{children}</>`
- Next.js 16 uses `proxy.(ts|js)` instead of `middleware.(ts|js)` for routing
- NProgress provider is always created when i18n is enabled (even if NProgress option is not selected)

---

## License

MIT

## Author

**imrashidov** — [GitHub](https://github.com/imrashidov)
