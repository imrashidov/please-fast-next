# ⚡ please-fast-next

**Lightning-fast interactive CLI for generating customizable Next.js projects.**

Build the perfect Next.js starter in seconds — with TypeScript/JavaScript, Tailwind, Axios, SCSS, NProgress, i18n, UUID, js-cookie, proxy middleware, and more.

![Next.js](https://img.shields.io/badge/Next.js-Latest-black?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Node](https://img.shields.io/badge/Node-18%2B-green?style=for-the-badge)
![NPM](https://img.shields.io/badge/NPM-please--fast--next-red?style=for-the-badge)

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

### 🌐 **Networking**

- Optional **Axios** installation
- Choose Axios file type:
  - `axios.js`
  - `axios.ts`
- Auto-created:
  - `/services/api/axios.(js/ts)`
  - Interceptors (request/response)
  - `/services/endpoints.(js/ts)`
- Optional **proxy.ts** for server-side API proxy (great for SSR)

### 🎨 **Styling Options**

- Optional **Tailwind CSS**
- Optional **SCSS**
  - `/styles/globals.scss`
  - variables + mixins ready

### 🚥 **Progress Indicators**

- Optional **Next.js NProgress**
  - Auto-integration into `app/layout.(js/ts)x`
  - Custom loader styles

### 🔧 **Utilities**

- Optional `uuid` installation
- Optional `js-cookie`
- Optional **extended `public/` structure**

### 🌍 **i18n Support**

- Optional full internationalization setup:
  - `/i18n/config.(js/ts)`
  - `/i18n/locales/{az,en,ru}`
  - translation JSON files
  - auto provider structure

### 📁 **Generated Folder Structure**

Depending on your answers, CLI can generate:
