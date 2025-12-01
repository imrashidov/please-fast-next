# ⚡ please-fast-next

**Lightning-fast interactive CLI for generating customizable Next.js projects.**

Build the perfect Next.js starter in seconds — with TypeScript/JavaScript, Tailwind, Axios, SCSS, NProgress, i18n, js-cookie, and more.

![Next.js](https://img.shields.io/badge/Next.js-Latest-black?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Node](https://img.shields.io/badge/Node-18%2B-green?style=for-the-badge)
![NPM](https://img.shields.io/badge/NPM-please--fast--next-red?style=for-the-badge)

---

# 🌐 GitHub Repository

[https://github.com/imrashidov/please-fast-next](https://github.com/imrashidov/please-fast-next)

---

# 📦 Installation

Install **please-fast-next** globally via npm:

```bash
npm install -g please-fast-next
```

or using Yarn:

```bash
yarn global add please-fast-next
```

---

# 🧪 Usage

Run the CLI:

```bash
please-fast-next
```

---

# ▶ Start Your Project

```bash
cd my-app
npm install
npm run dev
```

---

# 🚀 About

**please-fast-next** is an interactive CLI tool that helps developers instantly generate a clean, modern, fully configurable Next.js project.

Instead of manually installing packages, creating folders, writing axios setups, setting up i18n, configuring Tailwind/SCSS — the CLI asks you what you want and builds everything automatically.

Perfect for:

- Frontend developers
- Agencies
- Fast prototyping
- Boilerplate creation
- Personal starter templates

---

# ✨ Features

The CLI asks step-by-step questions and configures your project accordingly:

### 🧱 **Base Setup**

- Next.js **latest version**
- App Router enabled
- Choose: **TypeScript** or **JavaScript**
- Automatic cleanup of default Next.js files (fonts, favicon, SVG files)

### 🌐 **Networking**

- Optional **Axios** installation
- Auto-created:
  - `/api/axios.(js/ts)` - Full axios instance with interceptors
  - Request/response interceptors with token refresh
  - 429 (Too Many Requests) handling
  - 401 (Unauthorized) handling with automatic token refresh
- **js-cookie** automatically installed with Axios

### 🎨 **Styling Options**

- Optional **Tailwind CSS**
- Optional **SCSS** support
  - `/app/[locale]/globals.scss` (if i18n enabled)
  - Pre-configured variables and mixins

### 🚥 **Progress Indicators**

- Optional **NProgress** loader
  - Auto-created `/providers/Provider.(jsx/tsx)`
  - Integrated with `next-nprogress-bar`
  - Customizable progress bar

### 🔧 **Utilities**

- **@svgr/webpack** automatically installed (for SVG support)
- Optional **extended `public/` structure**
  - `/public/assets`
  - `/public/icons`

### 🌍 **i18n Support**

- Optional full internationalization setup with **next-intl**
- Auto-created files:
  - `/i18n/routing.(js/ts)` - Routing configuration
  - `/i18n/navigation.(js/ts)` - Navigation utilities with `isActive` and `useIsActive` helpers
  - `/i18n/request.(js/ts)` - Server-side request configuration with translation loading
- Auto-created structure:
  - `/app/[locale]/layout.(jsx/tsx)` - Locale-specific layout
  - `/app/[locale]/page.(jsx/tsx)` - Locale-specific page
  - `/app/[locale]/globals.(css/scss)` - Locale-specific styles
- **Middleware/Proxy**:
  - Next.js 16+: Creates `proxy.(ts/js)` file
  - Next.js <16: Creates `middleware.(ts/js)` file
- **next.config.mjs** automatically configured with `next-intl` plugin
- Supports locales: **az**, **en**, **ru**

### 📁 **Generated Folder Structure**

Depending on your answers, CLI generates:

```
my-app/
├── app/
│   ├── layout.(jsx/tsx)          # Root layout (simplified if i18n enabled)
│   └── [locale]/                 # (if i18n enabled)
│       ├── layout.(jsx/tsx)      # Locale layout with NextIntlClientProvider
│       ├── page.(jsx/tsx)        # Locale page
│       └── globals.(css/scss)    # Global styles
├── api/                          # (if axios enabled)
│   └── axios.(js/ts)             # Axios instance with interceptors
├── providers/                    # (if nprogress enabled or i18n enabled)
│   └── Provider.(jsx/tsx)        # Progress bar provider
├── i18n/                         # (if i18n enabled)
│   ├── routing.(js/ts)           # Routing configuration
│   ├── navigation.(js/ts)       # Navigation utilities
│   └── request.(js/ts)          # Request configuration
├── public/
│   ├── assets/                   # (if extended structure enabled)
│   └── icons/                    # (if extended structure enabled)
├── middleware.(ts/js)           # (if i18n enabled, Next.js <16)
├── proxy.(ts/js)                 # (if i18n enabled, Next.js 16+)
└── next.config.mjs               # Next.js config (updated if i18n enabled)
```

---

# 📝 Notes

- All default Next.js files (fonts, favicon, SVG files) are automatically cleaned up
- If i18n is enabled, `app/page.(jsx/tsx)` is automatically removed
- If i18n is enabled, `app/layout.(jsx/tsx)` is simplified to just return `{children}`
- Next.js 16+ uses `proxy.(ts/js)` instead of `middleware.(ts/js)` for i18n routing
- `next.config.mjs` is automatically updated with `next-intl` plugin configuration

---

# 📄 License

MIT

---

# 👤 Author

**imrashidov**

GitHub: [https://github.com/imrashidov](https://github.com/imrashidov)
