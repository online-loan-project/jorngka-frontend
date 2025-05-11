<template>
  <div>
    <el-button @click="toggleLocale">
      <img
        :src="locale === 'en'
          ? 'https://flagcdn.com/us.svg'
          : 'https://flagcdn.com/kh.svg'"
        alt="Language Flag"
        width="20"
        height="15"
        style="margin-right: 8px;"
      />
      {{ locale === 'en' ? 'English' : 'Khmer' }}
    </el-button>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useCookies } from 'vue3-cookies'
import { onMounted } from 'vue'

const { locale } = useI18n()
const { cookies } = useCookies()

// Default locale
locale.value = 'en'

// Set locale based on cookie (client-side only)
onMounted(() => {
  const storedLocale = cookies.get('locale')
  if (storedLocale) {
    locale.value = storedLocale
  }
})

const toggleLocale = () => {
  const newLocale = locale.value === 'en' ? 'kh' : 'en'
  locale.value = newLocale
  cookies.set('locale', newLocale, { path: '/', expires: '7d' }) // Store locale in a cookie
}

</script>

