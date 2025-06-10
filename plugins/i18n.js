import { createI18n } from 'vue-i18n'
import en from '../locales/en'
import kh from '../locales/kh'

export default defineNuxtPlugin(({ vueApp }) => {
  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: 'en', // default locale
    fallbackLocale: 'en', // fallback locale
    messages: {
      en,
      kh
    }
  })
  vueApp.use(i18n)
})
