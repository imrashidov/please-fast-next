#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const prompts = require("prompts");
const chalk = require("chalk");

const questions = [
  {
    name: "projectName",
    type: "text",
    message: "What is your project name?",
    initial: "my-next-app",
  },
  {
    name: "language",
    type: "select",
    message: "Which language do you want to use?",
    choices: [
      { title: "TypeScript", value: "ts" },
      { title: "JavaScript", value: "js" },
    ],
  },
  {
    name: "axios",
    type: "confirm",
    message: "Do you want to install Axios?",
    initial: true,
  },
  {
    name: "tailwind",
    type: "confirm",
    message: "Install Tailwind CSS?",
    initial: true,
  },
  {
    name: "scss",
    type: "confirm",
    message: "Do you want SCSS support?",
    initial: false,
  },
  {
    name: "nprogress",
    type: "confirm",
    message: "Enable NProgress loader?",
    initial: true,
  },
  {
    name: "publicStructure",
    type: "confirm",
    message: "Generate extended public folder structure?",
    initial: true,
  },
  {
    name: "i18nSupport",
    type: "confirm",
    message: "Enable i18n support?",
    initial: true,
  },
];

async function createProject() {
  console.log(chalk.cyan.bold("\n🚀 Welcome to please-fast-next!"));
  const answers = await prompts(questions);
  const projectName = answers?.projectName;
  if (!projectName) {
    console.log(chalk.red("Project name is required"));
    process.exit(1);
  }

  const projectPath = path.join(process.cwd(), projectName);

  if (fs.existsSync(projectPath)) {
    console.log(chalk.red("Project already exists"));
    process.exit(1);
  }

  console.log(chalk.green(`Creating project ${projectName}...`));

  try {
    await createFolderStructure(projectPath, answers);
    console.log(chalk.green.bold("✅ Project created successfully"));
    console.log(chalk.cyan("To start the project:"));
    console.log(chalk.white(`  cd ${answers.projectName}`));
    console.log(chalk.white("  npm install"));
    console.log(chalk.white("  npm run dev\n"));
  } catch (error) {
    console.error(chalk.red("Error creating project:"), error.message);
    process.exit(1);
  }
}

function cleanDefaultFiles(projectPath, ext, langExt, i18nSupport) {
  const layoutPath = path.join(projectPath, "app", `layout.${ext}`);
  if (fs.existsSync(layoutPath)) {
    let layoutContent = fs.readFileSync(layoutPath, "utf8");

    layoutContent = layoutContent.replace(
      /import\s+.*from\s+['"]next\/font\/google['"];?\s*\n/g,
      ""
    );

    layoutContent = layoutContent.replace(
      /import\s+.*from\s+['"]next\/font\/local['"];?\s*\n/g,
      ""
    );

    layoutContent = layoutContent.replace(
      /import\s+['"].*globals\.css['"];?\s*\n/g,
      ""
    );

    layoutContent = layoutContent.replace(
      /const\s+\w+\s*=\s*(Inter|Roboto|Open_Sans)\([^)]*\);?\s*\n/g,
      ""
    );

    layoutContent = layoutContent.replace(
      /className=\{.*\w+\.className.*\}/g,
      ""
    );

    layoutContent = layoutContent.replace(/\n{3,}/g, "\n\n");

    fs.writeFileSync(layoutPath, layoutContent);
  }

  if (i18nSupport) {
    const pagePath = path.join(projectPath, "app", `page.${ext}`);
    if (fs.existsSync(pagePath)) {
      try {
        fs.unlinkSync(pagePath);
      } catch (error) {}
    }
  } else {
    const pagePath = path.join(projectPath, "app", `page.${ext}`);
    if (fs.existsSync(pagePath)) {
      let pageContent = fs.readFileSync(pagePath, "utf8");

      pageContent = pageContent.replace(
        /import\s+.*from\s+['"].*\.module\.css['"];?\s*\n/g,
        ""
      );

      pageContent = pageContent.replace(/className=\{.*styles\.\w+.*\}/g, "");

      pageContent = pageContent.replace(/\n{3,}/g, "\n\n");

      fs.writeFileSync(pagePath, pageContent);
    }
  }

  const pageModuleCssPath = path.join(projectPath, "app", "page.module.css");
  if (fs.existsSync(pageModuleCssPath)) {
    try {
      fs.unlinkSync(pageModuleCssPath);
    } catch (error) {}
  }

  const globalsCssPath = path.join(projectPath, "app", "globals.css");
  if (fs.existsSync(globalsCssPath)) {
    try {
      fs.unlinkSync(globalsCssPath);
    } catch (error) {}
  }

  const faviconPath = path.join(projectPath, "app", "favicon.ico");
  if (fs.existsSync(faviconPath)) {
    try {
      fs.unlinkSync(faviconPath);
    } catch (error) {}
  }

  const publicSvgFiles = ["next.svg", "vercel.svg"];
  publicSvgFiles.forEach((svgFile) => {
    const svgPath = path.join(projectPath, "public", svgFile);
    if (fs.existsSync(svgPath)) {
      try {
        fs.unlinkSync(svgPath);
      } catch (error) {}
    }
  });
}

async function createFolderStructure(projectPath, config) {
  const isTypeScript = config.language === "ts";
  const ext = isTypeScript ? "tsx" : "jsx";
  const langExt = isTypeScript ? "ts" : "js";
  const axiosExt = langExt;
  const projectName = config.projectName;

  console.log(chalk.yellow("Creating Next.js project..."));
  const createNextAppArgs = [
    projectName,
    isTypeScript ? "--typescript" : "--js",
    config.tailwind ? "--tailwind" : "--no-tailwind",
    "--app",
    "--no-src-dir",
    "--import-alias",
    "@/*",
    "--use-npm",
    "--yes",
  ];

  try {
    execSync(`npx create-next-app@latest ${createNextAppArgs.join(" ")}`, {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (error) {
    throw new Error("Failed to create Next.js project");
  }

  cleanDefaultFiles(projectPath, ext, langExt, config.i18nSupport);

  const packagesToInstall = [];
  packagesToInstall.push("@svgr/webpack");
  if (config.axios) {
    packagesToInstall.push("axios");
    packagesToInstall.push("js-cookie");
  }
  if (config.scss) packagesToInstall.push("sass");
  if (config.nprogress) packagesToInstall.push("next-nprogress-bar");
  if (config.i18nSupport) {
    packagesToInstall.push("next-intl");
    if (!config.nprogress) {
      packagesToInstall.push("next-nprogress-bar");
    }
  }

  if (packagesToInstall.length > 0) {
    console.log(chalk.yellow("Installing additional packages..."));
    try {
      execSync(`npm install ${packagesToInstall.join(" ")}`, {
        stdio: "inherit",
        cwd: projectPath,
      });
    } catch (error) {
      console.warn(
        chalk.yellow("Warning: Some packages may not have installed correctly")
      );
    }
  }

  if (config.axios) {
    const apiPath = path.join(projectPath, "api");
    fs.mkdirSync(apiPath, { recursive: true });

    const isAxiosTypeScript = axiosExt === "ts";
    const axiosContent = isAxiosTypeScript
      ? `import axios from "axios";

import Cookies from "js-cookie";

let isRefreshing: boolean = false;

export let isLoading: boolean = false;

let failedQueue: Array<(token: string) => void> = [];

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: {
    Lang: Cookies.get("NEXT_LOCALE") || "en",
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const NEXT_LOCALE = Cookies.get("NEXT_LOCALE") || "en";
      config.headers["Lang"] = NEXT_LOCALE;
      const token = Cookies.get("token");
      if (token) {
        config.headers.Authorization = \`Bearer \${token}\`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    isLoading = false;
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 429) {
      isLoading = true;
      console.log("Loading... Too Many Requests (429)");
      return new Promise((resolve) => {
        setTimeout(() => {
          isLoading = false;
          resolve(axiosInstance.request(originalRequest));
        }, 3000);
      });
    }
    if (error.response?.status === 401 && !isRefreshing) {
      isRefreshing = true;
      const refreshToken = Cookies.get("refresh_token");
      if (refreshToken) {
        try {
          const response = await axiosInstance.post("/refresh", {
            refresh_token: refreshToken,
          });
          const newToken = response.data.token;
          Cookies.set("token", newToken);
          originalRequest.headers.Authorization = \`Bearer \${newToken}\`;
          isRefreshing = false;
          failedQueue.forEach((callback) => callback(newToken));
          failedQueue = [];
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
    isLoading = false;
    return Promise.reject(error);
  }
);

export default axiosInstance;
`
      : `import axios from "axios";

import Cookies from "js-cookie";

let isRefreshing = false;

export let isLoading = false;

let failedQueue = [];

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: {
    Lang: Cookies.get("NEXT_LOCALE") || "en",
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const NEXT_LOCALE = Cookies.get("NEXT_LOCALE") || "en";
      config.headers["Lang"] = NEXT_LOCALE;
      const token = Cookies.get("token");
      if (token) {
        config.headers.Authorization = \`Bearer \${token}\`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    isLoading = false;
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 429) {
      isLoading = true;
      console.log("Loading... Too Many Requests (429)");
      return new Promise((resolve) => {
        setTimeout(() => {
          isLoading = false;
          resolve(axiosInstance.request(originalRequest));
        }, 3000);
      });
    }
    if (error.response?.status === 401 && !isRefreshing) {
      isRefreshing = true;
      const refreshToken = Cookies.get("refresh_token");
      if (refreshToken) {
        try {
          const response = await axiosInstance.post("/refresh", {
            refresh_token: refreshToken,
          });
          const newToken = response.data.token;
          Cookies.set("token", newToken);
          originalRequest.headers.Authorization = \`Bearer \${newToken}\`;
          isRefreshing = false;
          failedQueue.forEach((callback) => callback(newToken));
          failedQueue = [];
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
    isLoading = false;
    return Promise.reject(error);
  }
);

export default axiosInstance;
`;

    fs.writeFileSync(path.join(apiPath, `axios.${axiosExt}`), axiosContent);
  }

  if (config.nprogress) {
    const providersPath = path.join(projectPath, "providers");
    fs.mkdirSync(providersPath, { recursive: true });

    const providerContent = isTypeScript
      ? `"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <ProgressBar
        color="#ffb0cd"
        options={{
          showSpinner: false,
          minimum: 0.3,
          easing: "ease",
          speed: 300,
        }}
        shallowRouting
      />
    </>
  );
};

export default Provider;
`
      : `"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

const Provider = ({ children }) => {
  return (
    <>
      {children}
      <ProgressBar
        color="#ffb0cd"
        options={{
          showSpinner: false,
          minimum: 0.3,
          easing: "ease",
          speed: 300,
        }}
        shallowRouting
      />
    </>
  );
};

export default Provider;
`;

    fs.writeFileSync(
      path.join(providersPath, `Provider.${ext}`),
      providerContent
    );

    const layoutPath = path.join(projectPath, "app", `layout.${ext}`);
    if (fs.existsSync(layoutPath)) {
      let layoutContent = fs.readFileSync(layoutPath, "utf8");
      if (!layoutContent.includes("providers/Provider")) {
        const providerImport = `import Provider from "@/providers/Provider";\n`;

        const importMatch = layoutContent.match(/(import\s+.*\n)/);
        if (importMatch) {
          layoutContent = layoutContent.replace(
            /(import\s+.*\n)/,
            `$1${providerImport}`
          );
        } else {
          layoutContent = providerImport + layoutContent;
        }

        const bodyRegex = /(<body[^>]*>)([\s\S]*?)(<\/body>)/;
        const bodyMatch = layoutContent.match(bodyRegex);
        if (bodyMatch) {
          const bodyOpen = bodyMatch[1];
          const bodyContent = bodyMatch[2];
          const bodyClose = bodyMatch[3];

          layoutContent = layoutContent.replace(
            bodyRegex,
            `${bodyOpen}\n        <Provider>${bodyContent}        </Provider>\n      ${bodyClose}`
          );
        }

        fs.writeFileSync(layoutPath, layoutContent);
      }
    }
  }

  if (config.publicStructure) {
    const publicDirs = ["assets", "icons"];
    publicDirs.forEach((dir) => {
      fs.mkdirSync(path.join(projectPath, "public", dir), { recursive: true });
    });
  }

  if (config.i18nSupport) {
    const i18nPath = path.join(projectPath, "i18n");
    fs.mkdirSync(i18nPath, { recursive: true });

    const routingPath = path.join(i18nPath, `routing.${langExt}`);
    const routingContent = `import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["az", "en", "ru"],
  defaultLocale: "az",
  localePrefix: "as-needed",
  localeDetection: false,
  pathnames: {
    "/": "/",
  },
});
`;

    fs.writeFileSync(routingPath, routingContent);

    const navigationPath = path.join(i18nPath, `navigation.${langExt}`);
    const navigationContent = `import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
`;

    fs.writeFileSync(navigationPath, navigationContent);

    const requestPath = path.join(i18nPath, `request.${langExt}`);
    const requestContent = isTypeScript
      ? `import { getRequestConfig } from "next-intl/server";

import axiosInstance from "@/api/axios";

import { routing } from "./routing";

import { cookies } from "next/headers";

type TranslationMessages = Record<string, string | Record<string, unknown>>;

const transformKeys = (obj: unknown): unknown => {
  if (typeof obj !== "object" || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeys(item));
  }

  return Object.entries(obj as Record<string, unknown>).reduce(
    (acc: Record<string, unknown>, [key, value]) => {
      const newKey = key.replace(/\\./g, "_");
      acc[newKey] = transformKeys(value);
      return acc;
    },
    {}
  );
};

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "az" | "en" | "ru")) {
    locale = routing.defaultLocale;
  }

  const cookieStore = await cookies();

  const language = cookieStore.get("NEXT_LOCALE")?.value || locale;

  try {
    const response = await axiosInstance.get<TranslationMessages>(
      \`\${process.env.NEXT_PUBLIC_API_URL}/translation-list\`,
      {
        headers: {
          Lang: language,
        },
      }
    );

    const messages = transformKeys(response.data || {}) as TranslationMessages;

    return {
      locale,
      messages,
    };
  } catch (error) {
    console.error("Failed to load translations:", error);
    return {
      locale,
      messages: {},
    };
  }
});
`
      : `import { getRequestConfig } from "next-intl/server";

import axiosInstance from "@/api/axios";

import { routing } from "./routing";

import { cookies } from "next/headers";

const transformKeys = (obj) => {
  if (typeof obj !== "object" || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeys(item));
  }

  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      const newKey = key.replace(/\\./g, "_");
      acc[newKey] = transformKeys(value);
      return acc;
    },
    {}
  );
};

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale)) {
    locale = routing.defaultLocale;
  }

  const cookieStore = await cookies();

  const language = cookieStore.get("NEXT_LOCALE")?.value || locale;

  try {
    const response = await axiosInstance.get(
      \`\${process.env.NEXT_PUBLIC_API_URL}/translation-list\`,
      {
        headers: {
          Lang: language,
        },
      }
    );

    const messages = transformKeys(response.data || {});

    return {
      locale,
      messages,
    };
  } catch (error) {
    console.error("Failed to load translations:", error);
    return {
      locale,
      messages: {},
    };
  }
});
`;

    fs.writeFileSync(requestPath, requestContent);

    const packageJsonPath = path.join(projectPath, "package.json");
    let nextVersion = "15";
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf8")
        );
        const nextDep =
          packageJson.dependencies?.next || packageJson.devDependencies?.next;
        if (nextDep) {
          const versionMatch = nextDep.match(/(\d+)\./);
          if (versionMatch) {
            nextVersion = versionMatch[1];
          }
        }
      } catch (error) {}
    }

    const useProxy = parseInt(nextVersion) >= 16;

    if (useProxy) {
      const proxyPath = path.join(projectPath, `proxy.${langExt}`);
      const proxyContent = isTypeScript
        ? `import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
`
        : `import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
`;

      fs.writeFileSync(proxyPath, proxyContent);
    } else {
      const middlewarePath = path.join(projectPath, `middleware.${langExt}`);
      const middlewareContent = isTypeScript
        ? `import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
`
        : `import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
`;

      fs.writeFileSync(middlewarePath, middlewareContent);
    }

    const appLayoutPath = path.join(projectPath, "app", `layout.${ext}`);
    if (fs.existsSync(appLayoutPath)) {
      const rootLayoutContent = isTypeScript
        ? `export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
`
        : `export default function RootLayout({ children }) {
  return <>{children}</>;
}
`;

      fs.writeFileSync(appLayoutPath, rootLayoutContent);
    }

    const localeFolderPath = path.join(projectPath, "app", "[locale]");
    fs.mkdirSync(localeFolderPath, { recursive: true });

    const globalsFileName = config.scss ? "globals.scss" : "globals.css";
    const globalsFilePath = path.join(localeFolderPath, globalsFileName);

    if (config.scss) {
      const globalsScssContent = `$primary-color: #0070f3;
$secondary-color: #7928ca;
$text-color: #333;
$bg-color: #fff;

@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin transition($property: all, $duration: 0.3s) {
  transition: $property $duration ease;
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}

body {
  color: $text-color;
  background: $bg-color;
}

a {
  color: inherit;
  text-decoration: none;
}
`;

      fs.writeFileSync(globalsFilePath, globalsScssContent);
    } else {
      const globalsCssContent = `* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}

body {
  color: #333;
  background: #fff;
}

a {
  color: inherit;
  text-decoration: none;
}
`;

      fs.writeFileSync(globalsFilePath, globalsCssContent);
    }

    const localePagePath = path.join(localeFolderPath, `page.${ext}`);
    const localePageContent = isTypeScript
      ? `const LocalePage = () => {
  return (
    <>
      <h1>Please Fast Next</h1>
    </>
  );
};

export default LocalePage;
`
      : `const LocalePage = () => {
  return (
    <>
      <h1>Please Fast Next</h1>
    </>
  );
};

export default LocalePage;
`;

    fs.writeFileSync(localePagePath, localePageContent);

    if (!config.nprogress) {
      const providersPath = path.join(projectPath, "providers");
      fs.mkdirSync(providersPath, { recursive: true });

      const providerContent = isTypeScript
        ? `"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <ProgressBar
        color="#ffb0cd"
        options={{
          showSpinner: false,
          minimum: 0.3,
          easing: "ease",
          speed: 300,
        }}
        shallowRouting
      />
    </>
  );
};

export default Provider;
`
        : `"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

const Provider = ({ children }) => {
  return (
    <>
      {children}
      <ProgressBar
        color="#ffb0cd"
        options={{
          showSpinner: false,
          minimum: 0.3,
          easing: "ease",
          speed: 300,
        }}
        shallowRouting
      />
    </>
  );
};

export default Provider;
`;

      fs.writeFileSync(
        path.join(providersPath, `Provider.${ext}`),
        providerContent
      );
    }

    const localeLayoutPath = path.join(localeFolderPath, `layout.${ext}`);
    const localeLayoutContent = isTypeScript
      ? `import "./globals.${config.scss ? "scss" : "css"}";

import Provider from "@/providers/Provider";
import type { Metadata } from "next";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const LocaleLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;

  return (
    <html lang={locale} suppressHydrationWarning>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <body>
        <Provider>
            <main>{children}</main>
        </Provider>
      </body>
    </html>
  );
};

export default LocaleLayout;
`
      : `import "./globals.${config.scss ? "scss" : "css"}";

import Provider from "@/providers/Provider";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const LocaleLayout = async ({ children, params }) => {
  const { locale } = await params;

  return (
    <html lang={locale} suppressHydrationWarning>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <body>
        <Provider>
            <main>{children}</main>
        </Provider>
      </body>
    </html>
  );
};

export default LocaleLayout;
`;

    fs.writeFileSync(localeLayoutPath, localeLayoutContent);

    const nextConfigMjsPath = path.join(projectPath, "next.config.mjs");
    if (fs.existsSync(nextConfigMjsPath)) {
      let existingContent = fs.readFileSync(nextConfigMjsPath, "utf8");

      if (!existingContent.includes("createNextIntlPlugin")) {
        const pluginImport = `import createNextIntlPlugin from "next-intl/plugin";\n\n`;
        const pluginInit = `const withNextIntl = createNextIntlPlugin("./i18n/request.${langExt}");\n\n`;

        if (existingContent.includes("const nextConfig")) {
          existingContent = pluginImport + pluginInit + existingContent;
          existingContent = existingContent.replace(
            /export default (nextConfig|withNextIntl\(nextConfig\))/,
            "export default withNextIntl(nextConfig)"
          );
        } else {
          const newNextConfigContent = `import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.${langExt}");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NEXT_PUBLIC_IS_SSR === "true" ? "standalone" : undefined,
  generateEtags: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "your-image-hosting-url.com",
        pathname: "/**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ["image/webp"],
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  reactStrictMode: false,
  webpack(config) {
    config.module.rules.push({
      test: /\\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgoConfig: {
              plugins: [
                {
                  name: "preset-default",
                  params: {
                    overrides: {
                      removeViewBox: false,
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    });
    return config;
  },
};

export default withNextIntl(nextConfig);
`;

          existingContent = newNextConfigContent;
        }
      } else {
        existingContent = existingContent.replace(
          /createNextIntlPlugin\(["'][^"']+["']\)/,
          `createNextIntlPlugin("./i18n/request.${langExt}")`
        );
      }

      fs.writeFileSync(nextConfigMjsPath, existingContent);
    }
  }
}

createProject().catch(console.error);
