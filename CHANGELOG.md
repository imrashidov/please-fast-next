# Changelog

All notable changes to this project will be documented in this file.

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
