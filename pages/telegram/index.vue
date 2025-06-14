<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <el-card class="w-full max-w-md">
      <!-- Logged In State -->
      <div v-if="session.loggedIn" class="text-center">
        <h1 class="text-2xl font-bold text-gray-800 mb-4">Welcome!</h1>
        <p class="text-gray-600 mb-6">
          You are successfully authenticated via Telegram.
        </p>

        <el-card shadow="never" class="mb-6 text-left">
          <pre class="text-xs overflow-auto">{{
              JSON.stringify(session, null, 2)
            }}</pre>
        </el-card>

        <el-button type="danger" @click="logout" class="w-full">
          Logout
        </el-button>
      </div>

      <!-- Logged Out State -->
      <div v-else>
        <!-- Initial Prompt -->
        <div v-if="!showTelegramWidget" class="text-center">
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-2">
              Connect with Telegram
            </h2>
            <p class="text-gray-600">Secure login with your Telegram account</p>
          </div>

          <img
            src="https://telegram.org/img/t_logo.png"
            alt="Telegram Logo"
            class="w-16 h-16 mx-auto mb-6"
          />

          <div class="space-y-3">
            <div class="flex">
              <el-button
                type="primary"
                @click="showTelegramWidget = true"
                class="w-full"
              >
                <span class="flex items-center justify-center">
                  <i class="i-logos-telegram mr-2"></i>
                  Continue with Telegram
                </span>
              </el-button>
            </div>
            <el-button plain @click="declineTelegramLogin" class="w-full">
              Use Phone Number Verify
            </el-button>
          </div>
        </div>

        <!-- Telegram Widget -->
        <div v-else class="text-center">
          <h3 class="text-lg font-medium text-gray-800 mb-4">Telegram Login</h3>

          <div class="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <div class="flex items-start mb-3">
              <div class="flex-shrink-0 mt-1">
                <div class="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">1</div>
              </div>
              <div class="ml-3">
                <p class="font-medium text-blue-800">Start our Telegram bot</p>
                <p class="text-sm text-blue-700">Required to receive your OTP code</p>
                <el-button
                  type="primary"
                  @click="openTelegramBot"
                  class="w-full mt-2"
                  size="small"
                >
                  <span class="flex items-center justify-center gap-2">
                    <i class="i-logos-telegram"></i>
                    <span>Open @jorngka_bot</span>
                  </span>
                </el-button>
              </div>
            </div>

            <div class="flex items-start">
              <div class="flex-shrink-0 mt-1">
                <div class="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">2</div>
              </div>
              <div class="ml-3">
                <p class="font-medium text-blue-800">Connect your account</p>
                <p class="text-sm text-blue-700">Authenticate via Telegram widget below</p>
              </div>
            </div>
          </div>

          <div class="mb-6 flex justify-center">
            <TelegramLoginWidget
              telegram-login="jorngka_bot"
              @callback="handleTelegramCallback"
            />
          </div>

          <el-button plain @click="showTelegramWidget = false" class="w-full">
            Back
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/store/auth.js'

const { clearSession, session } = useUserSession()
const showTelegramWidget = ref(false)

const logout = () => {
  clearSession()
  showTelegramWidget.value = false
}

const authStore = useAuthStore()
const { telegramChat } = authStore

const declineTelegramLogin = () => {
  navigateTo('/otp')
}

const openTelegramBot = () => {
  window.open('https://t.me/jorngka_bot', '_blank')
}

const handleTelegramCallback = async (user) => {
  console.log('Telegram user data:', user)

  await telegramChat({ chat_id: user.id })

  ElNotification({
    title: 'Verification Required',
    message: `Welcome ${user.first_name}! Please type /start in @jorngka_bot to receive your OTP.`,
    type: 'warning',
    duration: 8000,
  })

  navigateTo('/otp')
}
</script>

<style>
.telegram-login-widget {
  @apply inline-block;
}

/* Animation for the step numbers */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.bg-blue-50 .flex-shrink-0 div {
  animation: pulse 2s infinite;
}
</style>