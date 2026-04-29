#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const https = require("https");
const prompts = require("prompts");
const chalk = require("chalk");

const pkg = require("./package.json");

const args = process.argv.slice(2);
if (args.includes("--version") || args.includes("-v")) {
  console.log(pkg.version);
  process.exit(0);
}

function checkForUpdates() {
  return new Promise((resolve) => {
    https
      .get(
        "https://registry.npmjs.org/please-fast-next/latest",
        { timeout: 3000 },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              const latest = JSON.parse(data).version;
              if (latest && latest !== pkg.version) {
                console.log(
                  chalk.yellow(
                    `\n⚠️  You are using please-fast-next v${pkg.version}, but v${latest} is available.`
                  )
                );
                console.log(
                  chalk.yellow(
                    `   Run ${chalk.bold("npm i -g please-fast-next")} to update.\n`
                  )
                );
              }
            } catch {}
            resolve();
          });
        }
      )
      .on("error", () => resolve())
      .on("timeout", function () {
        this.destroy();
        resolve();
      });
  });
}

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
  await checkForUpdates();
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
  if (i18nSupport) {
    const layoutJsxPath = path.join(projectPath, "app", `layout.${ext}`);
    const layoutJsPath = path.join(projectPath, "app", "layout.js");

    if (fs.existsSync(layoutJsxPath)) {
      try {
        fs.unlinkSync(layoutJsxPath);
      } catch (error) {}
    }
    if (fs.existsSync(layoutJsPath)) {
      try {
        fs.unlinkSync(layoutJsPath);
      } catch (error) {}
    }
  } else {
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
        /const\s+\w+\s*=\s*(Inter|Roboto|Open_Sans|Geist|Geist_Mono)\([^)]*\);?\s*\n/g,
        ""
      );

      layoutContent = layoutContent.replace(
        /className=\{[^}]*\w+\.(?:className|variable)[^}]*\}/g,
        ""
      );

      layoutContent = layoutContent.replace(/\n{3,}/g, "\n\n");

      fs.writeFileSync(layoutPath, layoutContent);
    }
  }

  if (i18nSupport) {
    const pageJsxPath = path.join(projectPath, "app", `page.${ext}`);
    if (fs.existsSync(pageJsxPath)) {
      try {
        fs.unlinkSync(pageJsxPath);
      } catch (error) {}
    }
    const pageJsPath = path.join(projectPath, "app", "page.js");
    if (fs.existsSync(pageJsPath)) {
      try {
        fs.unlinkSync(pageJsPath);
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

  const publicSvgFiles = ["next.svg", "vercel.svg", "file.svg", "globe.svg", "window.svg"];
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
    execSync(`npx create-next-app@16.2.2 ${createNextAppArgs.join(" ")}`, {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (error) {
    throw new Error("Failed to create Next.js project");
  }

  cleanDefaultFiles(projectPath, ext, langExt, config.i18nSupport);

  if (isTypeScript) {
    const tsconfigPath = path.join(projectPath, "tsconfig.json");
    if (fs.existsSync(tsconfigPath)) {
      try {
        const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));
        tsconfig.compilerOptions = tsconfig.compilerOptions || {};
        tsconfig.compilerOptions.target = "ES2022";
        fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + "\n");
      } catch (error) {
        console.warn(
          chalk.yellow("Warning: Failed to update tsconfig.json target to ES2022")
        );
      }
    }
  }

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
      ? `"use client";

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

type QueueItem = {
  resolve: (token: string) => void;
  reject: (reason?: unknown) => void;
};

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const flushQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error || !token) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use((config) => {
  const locale = Cookies.get("NEXT_LOCALE") || "en";
  config.headers["Lang"] = locale;
  const token = Cookies.get("token");
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequest | undefined;
    if (!originalRequest) return Promise.reject(error);

    if (error.response?.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return axiosInstance.request(originalRequest);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = \`Bearer \${token}\`;
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = Cookies.get("refresh_token");
      if (!refreshToken) {
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          \`\${process.env.NEXT_PUBLIC_BASE_URL}/refresh\`,
          { refresh_token: refreshToken }
        );
        const newToken: string = data.token;
        Cookies.set("token", newToken);
        flushQueue(null, newToken);
        originalRequest.headers.Authorization = \`Bearer \${newToken}\`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
`
      : `"use client";

import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const flushQueue = (error, token) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error || !token) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use((config) => {
  const locale = Cookies.get("NEXT_LOCALE") || "en";
  config.headers["Lang"] = locale;
  const token = Cookies.get("token");
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    if (error.response?.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return axiosInstance.request(originalRequest);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = \`Bearer \${token}\`;
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = Cookies.get("refresh_token");
      if (!refreshToken) {
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          \`\${process.env.NEXT_PUBLIC_BASE_URL}/refresh\`,
          { refresh_token: refreshToken }
        );
        const newToken = data.token;
        Cookies.set("token", newToken);
        flushQueue(null, newToken);
        originalRequest.headers.Authorization = \`Bearer \${newToken}\`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
`;

    fs.writeFileSync(path.join(apiPath, `axios.${axiosExt}`), axiosContent);

    const serverContent = isAxiosTypeScript
      ? `import { cookies } from "next/headers";

type FetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
  next?: { revalidate?: number | false; tags?: string[] };
};

export async function serverFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const token = cookieStore.get("token")?.value;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Lang: locale,
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = \`Bearer \${token}\`;

  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "";
  const response = await fetch(\`\${baseURL}\${path}\`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(
      \`serverFetch \${path} failed: \${response.status} \${response.statusText}\`
    );
  }

  return response.json() as Promise<T>;
}
`
      : `import { cookies } from "next/headers";

export async function serverFetch(path, options = {}) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const token = cookieStore.get("token")?.value;

  const headers = {
    "Content-Type": "application/json",
    Lang: locale,
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = \`Bearer \${token}\`;

  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "";
  const response = await fetch(\`\${baseURL}\${path}\`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(
      \`serverFetch \${path} failed: \${response.status} \${response.statusText}\`
    );
  }

  return response.json();
}
`;

    fs.writeFileSync(path.join(apiPath, `server.${axiosExt}`), serverContent);
  }

  if (config.nprogress) {
    const providersPath = path.join(projectPath, "providers");
    fs.mkdirSync(providersPath, { recursive: true });

    const providerContent = isTypeScript
      ? `"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

const ProgressBarProvider = ({ children }: { children: React.ReactNode }) => {
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

export default ProgressBarProvider;
`
      : `"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

const ProgressBarProvider = ({ children }) => {
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

export default ProgressBarProvider;
`;

    fs.writeFileSync(
      path.join(providersPath, `ProgressBarProvider.${ext}`),
      providerContent
    );

    const layoutPath = path.join(projectPath, "app", `layout.${ext}`);
    if (fs.existsSync(layoutPath)) {
      let layoutContent = fs.readFileSync(layoutPath, "utf8");
      if (!layoutContent.includes("providers/ProgressBarProvider")) {
        const providerImport = `import ProgressBarProvider from "@/providers/ProgressBarProvider";\n`;

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
            `${bodyOpen}\n        <ProgressBarProvider>${bodyContent}        </ProgressBarProvider>\n      ${bodyClose}`
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
    const navigationContent = isTypeScript
      ? `import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

export function isActive(
  currentPathname: string | null,
  href: string | { pathname?: string }
): boolean {
  if (!currentPathname || !href) return false;

  const hrefPath = typeof href === "string" ? href : href.pathname ?? "";

  if (!hrefPath) return false;

  const normalizePath = (path: string) => path.replace(/^\\/+|\\/+$/g, "");

  const current = normalizePath(currentPathname);
  const target = normalizePath(hrefPath);

  if (current === target) return true;

  if (current.startsWith(target + "/")) return true;

  return false;
}

export function useIsActive(href: string | { pathname?: string }): boolean {
  const pathname = usePathname();
  return isActive(pathname, href);
}
`
      : `import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

export function isActive(currentPathname, href) {
  if (!currentPathname || !href) return false;

  let hrefPath = typeof href === "string" ? href : href.pathname;

  if (!hrefPath) return false;

  const normalizePath = (path) => path.replace(/^\\/+|\\/+$/g, "");

  const current = normalizePath(currentPathname);
  const target = normalizePath(hrefPath);

  if (current === target) return true;

  if (current.startsWith(target + "/")) return true;

  return false;
}

export function useIsActive(href) {
  const pathname = usePathname();
  return isActive(pathname, href);
}
`;

    fs.writeFileSync(navigationPath, navigationContent);

    const requestPath = path.join(i18nPath, `request.${langExt}`);
    const requestContent = isTypeScript
      ? `import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

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

  try {
    const response = await fetch(
      \`\${process.env.NEXT_PUBLIC_API_URL}/translation-list\`,
      {
        headers: { Lang: locale },
        next: { revalidate: 3600, tags: ["translations"] },
      }
    );

    const data = await response.json();
    const messages = transformKeys(data || {}) as TranslationMessages;

    return { locale, messages };
  } catch (error) {
    console.error("Failed to load translations:", error);
    return { locale, messages: {} };
  }
});
`
      : `import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

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

  try {
    const response = await fetch(
      \`\${process.env.NEXT_PUBLIC_API_URL}/translation-list\`,
      {
        headers: { Lang: locale },
        next: { revalidate: 3600, tags: ["translations"] },
      }
    );

    const data = await response.json();
    const messages = transformKeys(data || {});

    return { locale, messages };
  } catch (error) {
    console.error("Failed to load translations:", error);
    return { locale, messages: {} };
  }
});
`;

    fs.writeFileSync(requestPath, requestContent);

    const proxyPath = path.join(projectPath, `proxy.${langExt}`);
    const proxyContent = isTypeScript
      ? `import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\\\..*).*)",
};
`
      : `import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\\\..*).*)",
};
`;

    fs.writeFileSync(proxyPath, proxyContent);

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

const ProgressBarProvider = ({ children }: { children: React.ReactNode }) => {
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

export default ProgressBarProvider;
`
        : `"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

const ProgressBarProvider = ({ children }) => {
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

export default ProgressBarProvider;
`;

      fs.writeFileSync(
        path.join(providersPath, `ProgressBarProvider.${ext}`),
        providerContent
      );
    }

    const localeLayoutPath = path.join(localeFolderPath, `layout.${ext}`);
    const localeLayoutContent = isTypeScript
      ? `import "./globals.${config.scss ? "scss" : "css"}";

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";

import ProgressBarProvider from "@/providers/ProgressBarProvider";
import { routing } from "@/i18n/routing";

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

const LocaleLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ProgressBarProvider>
            <main>{children}</main>
          </ProgressBarProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default LocaleLayout;
`
      : `import "./globals.${config.scss ? "scss" : "css"}";

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";

import ProgressBarProvider from "@/providers/ProgressBarProvider";
import { routing } from "@/i18n/routing";

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

const LocaleLayout = async ({ children, params }) => {
  const { locale } = await params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ProgressBarProvider>
            <main>{children}</main>
          </ProgressBarProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default LocaleLayout;
`;

    fs.writeFileSync(localeLayoutPath, localeLayoutContent);

    const nextConfigTsPath = path.join(projectPath, "next.config.ts");
    const nextConfigMjsPath = path.join(projectPath, "next.config.mjs");
    const nextConfigPath = fs.existsSync(nextConfigTsPath)
      ? nextConfigTsPath
      : nextConfigMjsPath;
    if (fs.existsSync(nextConfigPath)) {
      let existingContent = fs.readFileSync(nextConfigPath, "utf8");

      if (!existingContent.includes("createNextIntlPlugin") || existingContent.includes("/* config options here */")) {
        const newNextConfigContent = `import createNextIntlPlugin from "next-intl/plugin";
${isTypeScript ? `import { NextConfig } from "next";\n` : ""}
const withNextIntl = createNextIntlPlugin("./i18n/request.${langExt}");

/** @type {${isTypeScript ? "NextConfig" : "import('next').NextConfig"}} */
const nextConfig${isTypeScript ? `: NextConfig` : ``} = {
  output: "standalone",
  turbopack: {
    rules: {
      "*.svg": {
        loaders: [
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
        as: "*.js",
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "your-domain.com",
        pathname: "/**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ["image/webp"],
  },
};

export default withNextIntl(nextConfig);
`;

        existingContent = newNextConfigContent;
      } else {
        existingContent = existingContent.replace(
          /createNextIntlPlugin\(["'][^"']+["']\)/,
          `createNextIntlPlugin("./i18n/request.${langExt}")`
        );
      }

      fs.writeFileSync(nextConfigPath, existingContent);
    }
  }
}

createProject().catch(console.error);
