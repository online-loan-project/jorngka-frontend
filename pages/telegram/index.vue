<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <el-card class="w-full max-w-md">
      <!-- Logged In State -->
      <div v-if="session.loggedIn" class="text-center">
        <h1 class="text-2xl font-bold text-gray-800 mb-4">Welcome!</h1>
        <p class="text-gray-600 mb-6">You are successfully authenticated via Telegram.</p>

        <el-card shadow="never" class="mb-6 text-left">
          <pre class="text-xs overflow-auto">{{ JSON.stringify(session, null, 2) }}</pre>
        </el-card>

        <el-button
          type="danger"
          @click="logout"
          class="w-full"
        >
          Logout
        </el-button>
      </div>

      <!-- Logged Out State -->
      <div v-else>
        <!-- Initial Prompt -->
        <div v-if="!showTelegramWidget" class="text-center">
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-2">Connect with Telegram</h2>
            <p class="text-gray-600">Secure login with your Telegram account</p>
          </div>

          <img
            src="https://telegram.org/img/t_logo.png"
            alt="Telegram Logo"
            class="w-16 h-16 mx-auto mb-6"
          >

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
            <el-button
              plain
              @click="declineTelegramLogin"
              class="w-full"
            >
              Use Phone Number Verify
            </el-button>

          </div>
        </div>

        <!-- Telegram Widget -->
        <div v-else class="text-center">
          <h3 class="text-lg font-medium text-gray-800 mb-4">Telegram Login</h3>
          <p class="text-gray-600 mb-6">Authenticate with your Telegram account</p>

          <div class="mb-6 flex justify-center">
            <TelegramLoginWidget
              telegram-login="jorngka_bot"
              @callback="handleTelegramCallback"
            />
          </div>

          <el-button
            plain
            @click="showTelegramWidget = false"
            class="w-full"
          >
            Back
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/store/auth.js'

const { clearSession, session } = useUserSession();
const showTelegramWidget = ref(false);

const logout = () => {
  clearSession();
  showTelegramWidget.value = false;
};

const authStore = useAuthStore()
const { telegramChat } = authStore

const declineTelegramLogin = () => {
  navigateTo('/otp');
};

const handleTelegramCallback = async (user) => {
  console.log("Telegram user data:", user);

  // Example session setting - adapt to your actual auth flow
  // session.value = {
  //   loggedIn: true,
  //   user: {
  //     id: user.id,
  //     firstName: user.first_name,
  //     lastName: user.last_name,
  //     username: user.username,
  //     photoUrl: user.photo_url
  //   }
  // };

  await telegramChat({ chat_id: user.id })
  navigateTo('/otp');

  ElNotification({
    title: 'Login Successful',
    message: `Welcome ${user.first_name}!`,
    type: 'success'
  });
};
</script>

<style>
/* You might need this if the Telegram widget needs specific styling */
.telegram-login-widget {
  @apply inline-block;
}
</style>
