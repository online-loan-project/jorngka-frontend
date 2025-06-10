import { defineNuxtPlugin } from '#app'
import * as Icons from '@element-plus/icons-vue'

export default defineNuxtPlugin((nuxtApp) => {
  for (const [key, component] of Object.entries(Icons)) {
    nuxtApp.vueApp.component(key, component)
  }
})
