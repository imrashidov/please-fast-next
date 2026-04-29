# Changelog

All notable changes to this project will be documented in this file.

---

## [2.4.0] - 2026-04-30

### Fixed
- `api/axios.{ts,js}` template: removed module-level state shared across SSR requests. Cookie reads moved out of module init (server-side `js-cookie` returned `undefined`, locking the instance to default `Lang`). Marked file `"use client"` so it can no longer be imported into server components
- `api/axios.{ts,js}` template: `failedQueue` is now actually used — concurrent requests during a token refresh queue up and replay with the new token (previously the queue was never read and pending requests were lost)
- `i18n/request.{ts,js}` template: switched from `axiosInstance` to native `fetch` with `next: { revalidate: 3600, tags: ["translations"] }` so SSR translation loads participate in Next.js fetch cache instead of refetching every request
- `i18n/request.{ts,js}` template: dropped the `NEXT_LOCALE` cookie read that conflicted with the URL locale; the `Lang` header now uses the locale resolved from `requestLocale`
- `proxy.{ts,js}` template: `matcher` regex now escapes the literal dot (`\\.`) — the previous `\.` was silently dropped by the TypeScript string parser, so the static-file exclusion did not work as intended
- `app/[locale]/layout.{tsx,jsx}` template: removed the duplicate `<meta name="viewport">` tag (the `viewport` export already handles it). Removed `userScalable: false` and `maximumScale: 1` to comply with WCAG 2.5.5 (zoom must not be blocked)
- `app/[locale]/layout.{tsx,jsx}` template: added `NextIntlClientProvider` with messages from `getMessages()` so client components can use `useTranslations` (required since next-intl v4)
- `app/layout.{tsx,jsx}` is now deleted in i18n mode instead of being overwritten with an empty pass-through layout — `app/[locale]/layout.{tsx,jsx}` is the real root layout (with `<html>` and `<body>`), so the dual layout structure is gone
- `next.config.{ts,mjs}` template: removed the `webpack(config)` block (Next.js 16 production builds default to Turbopack, so the duplicate webpack rule was dead/conflicting); removed `reactStrictMode: false` (suppresses useful React 19 warnings); removed `generateEtags: false` (hurt CDN caching with no documented reason)

### Added
- `api/server.{ts,js}` template: new `serverFetch` helper for server components / server actions, reading cookies via `next/headers` and passing through `Lang` + `Authorization` headers
- `providers/ProgressBarProvider.{tsx,jsx}`: renamed from `Provider` so the name reflects its single responsibility (NProgress bar). Layouts import it as `ProgressBarProvider`
- `tsconfig.json` target is patched to `ES2022` after `create-next-app` runs (the default `ES2017` is too old for React 19 + Next 16 and produces heavy polyfills for async iterators / optional chaining)

---

## [2.3.1] - 2026-04-30

### Fixed
- `next.config` template was not being fully replaced when `create-next-app` generated a default empty config (`/* config options here */`); the CLI was patching the existing file instead of writing the full template

---

## [2.3.0] - 2026-04-30

### Added
- `--version` / `-v` flag: running `please-fast-next --version` now prints the current version and exits immediately instead of launching the interactive prompt

### Added
- Logo added to README (displayed on npmjs.com)
- `CHANGELOG.md` added to the project
- `assets/` folder included in npm package files

### Changed
- `next.config.ts` template: replaced `import type { NextConfig }` with `import { NextConfig }` to match standard usage
- `next.config` template: `output` is now statically set to `"standalone"` instead of reading from `NEXT_PUBLIC_IS_SSR` env variable
- `next.config` template: turbopack SVG rule now uses the full `@svgr/webpack` loader options object (with `svgoConfig`) instead of the bare string `"@svgr/webpack"`
- `next.config` template: `/** @type {NextConfig} */` JSDoc comment added for TypeScript; `/** @type {import('next').NextConfig} */` for JavaScript
- `next.config` template: default `remotePatterns` hostname changed from `your-image-hosting-url.com` to `your-domain.com`

---

## [2.1.0] - 2025-07-10

### Changed
- Added update check warning: if a newer version is available on npm, the CLI warns the user at startup
- Version bump and minor internal cleanup

---

## [2.0.0] - 2025-07-01

### Changed
- Major rewrite and restructure
- Improved i18n scaffolding with full `next-intl` support
- `proxy.(ts|js)` replaces `middleware.(ts|js)` for Next.js 16 routing
- Axios instance now includes 429 retry and 401 token refresh interceptors
- NProgress provider auto-integrated into locale layout when i18n is enabled

---

## [1.0.6] - 2025-06-01

### Added
- Initial stable release
- Interactive CLI with prompts for: project name, TypeScript/JavaScript, Axios, Tailwind, SCSS, NProgress, public folder structure, i18n
- `@svgr/webpack` support for both turbopack and webpack
- Auto-cleanup of default Next.js boilerplate files
