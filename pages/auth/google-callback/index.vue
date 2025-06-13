<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
      <div class="text-center mb-6">
        <!-- Using SVG for Google logo -->
        <div class="flex justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="60" height="60">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            <path fill="none" d="M1 1h22v22H1z"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">
          <template v-if="processing">
            Authenticating with Google...
          </template>
          <template v-else-if="error">
            Authentication Failed
          </template>
          <template v-else>
            Redirecting...
          </template>
        </h1>
      </div>

      <div class="space-y-4">
        <!-- Loading state -->
        <template v-if="processing">
          <div class="flex flex-col items-center">
            <el-progress :percentage="progress" :indeterminate="true" />
            <p class="mt-4 text-gray-600">
              Please wait while we verify your credentials...
            </p>
          </div>
        </template>

        <!-- Error state -->
        <template v-else-if="error">
          <el-alert
            :title="error"
            type="error"
            :closable="false"
            show-icon
            class="mb-4"
          />
          <div>
            <el-button
              type="primary"
              class="w-full"
              @click="retryLogin"
            >
              <el-icon class="mr-2"><refresh /></el-icon>
              Try Again
            </el-button>
          </div>
          <div>
            <el-button
              class="w-full"
              @click="$router.push('/login')"
            >
              <el-icon class="mr-2"><refresh /></el-icon>
              Back to Login
            </el-button>
          </div>
        </template>

        <!-- Success state (briefly shown before redirect) -->
        <template v-else>
          <el-alert
            title="Login successful!"
            type="success"
            :closable="false"
            show-icon
            class="mb-4"
          />
          <p class="text-gray-600 text-center">
            You will be redirected shortly...
          </p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useGoogleAuthStore } from '~/store/google'
import { Refresh } from '@element-plus/icons-vue'

definePageMeta({ layout: 'default' })

const googleAuth = useGoogleAuthStore()
const route = useRoute()
const router = useRouter()

const processing = ref(true)
const error = ref(null)
const progress = ref(0)

// Simulate progress for better UX
const simulateProgress = () => {
  const interval = setInterval(() => {
    if (progress.value < 90) {
      progress.value += 10
    }
  }, 300)
  return interval
}

const handleGoogleCallback = async () => {
  const code = route.query.code

  if (!code) {
    error.value = 'No authorization code found in callback URL.'
    processing.value = false
    return
  }

  const progressInterval = simulateProgress()

  try {
    const { data } = await googleAuth.handleGoogleCallback({ code })
    console.log('Google login successful:', data)

    // Complete progress
    progress.value = 100
    await new Promise(resolve => setTimeout(resolve, 500))
    if (!data.telegram_chat_id) {
      clearInterval(progressInterval)
      processing.value = false
      ElMessage.error('Please connect your telegram account')
      return navigateTo('/telegram')
    }
    // Redirect to dashboard or intended route
    const redirectPath = route.query.redirect || '/dashboard'
    await navigateTo(redirectPath)
  } catch (err) {
    console.error('Google login failed:', err)
    error.value = err.message || 'Failed to authenticate with Google. Please try again.'
  } finally {
    clearInterval(progressInterval)
    processing.value = false
  }
}

const retryLogin = () => {
  processing.value = true
  error.value = null
  progress.value = 0
  handleGoogleCallback()
}

onMounted(() => {
  handleGoogleCallback()
})
</script>