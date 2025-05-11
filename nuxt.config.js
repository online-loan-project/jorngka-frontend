export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  modules: [
    "@nuxtjs/eslint-module",
    "@pinia/nuxt",
    ["@vee-validate/nuxt", { autoImports: true }],
    "dayjs-nuxt",
    ["@vueuse/nuxt", { ssr: false }],
    ["@nuxtjs/sitemap"],
    "@element-plus/nuxt",
    "nuxt-telegram-auth",
  ],

  css: [
    "~/assets/scss/index.scss"
  ],

  sassOptions: {
    silenceDeprecations: ["legacy-js-api"],
  },

  elementPlus: { /** Options */ },

  runtimeConfig: {
    TELEGRAM_TOKEN: "7806063687:AAHuOOTEwvmO92xXvyJXJGWxXc0YXzbt-Tk",
    public: {
      appBaseUrl: process.env.APP_BASE_URL,
      appSiteUrl: process.env.APP_SITE_URL,
      serverBaseUrl: process.env.SERVER_BASE_URL,
      serverApiUrl: process.env.SERVER_API_URL,
      apiVersion: process.env.API_VERSION
    }
  },

  vite: {
    server: {
      allowedHosts: true,
    },
  },

  app: {
    head: {
      title: "JorngKa"
    }
  },

  sitemap: {
    hostname: process.env.APP_SITE_URL || "https://yourwebsite.com",
    routes: async () => {
      return [
        "/page-1",
        "/page-2",
        "/products/product-1",
        "/products/product-2"
      ];
    },
    gzip: true,
    exclude: [
      "/admin/**"
    ]
  },

  plugins: [
  ],


  compatibilityDate: "2024-12-07",
});
