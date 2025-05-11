<script setup>
import { ref, onUnmounted } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { useAuthStore } from '~/store/auth.js'

const user = useCookie('user').value
if (!user || !user.phone) {
  ElMessage.error('User information not found. Please log in again.')
  navigateTo('/login')
}

const authStore = useAuthStore()
const { sendCode, verifyCode } = authStore

const otp = ref('')
const isVerifying = ref(false)
const isSending = ref(false)
const countdown = ref(0)
const countdownInterval = ref(null)
const codeSent = ref(false)

const handleSendCode = async () => {
  if (isSending.value || countdown.value > 0) return

  isSending.value = true
  try {
    await sendCode()
    codeSent.value = true
    startCountdown()
    ElNotification({
      title: 'OTP Sent',
      message: `A 4-digit code has been sent to ${user.phone}`,
      type: 'success',
      duration: 5000
    })
  } catch (error) {
    ElMessage.error('Failed to send OTP. Please try again.')
    console.error(error)
  } finally {
    isSending.value = false
  }
}

const verifyOtp = async () => {
  if (!otp.value || otp.value.length !== 4) {
    ElMessage.error('Please enter a valid 4-digit code')
    return
  }

  isVerifying.value = true

  try {
    // Your actual verification API call would go here
    await verifyCode({ code: otp.value })

    ElNotification({
      title: 'Verified',
      message: 'Phone number verification successful!',
      type: 'success'
    })
    navigateTo('/liveliness')
  } catch (error) {
    console.error('Verification failed:', error)
    ElMessage.error('Invalid OTP. Please try again.')
  } finally {
    isVerifying.value = false
  }
}

const startCountdown = () => {
  clearCountdown()
  countdown.value = 30 // 30 seconds countdown

  countdownInterval.value = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearCountdown()
    }
  }, 1000)
}

const clearCountdown = () => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
    countdownInterval.value = null
  }
}

onUnmounted(() => {
  clearCountdown()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Phone Verification
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        We'll send a verification code to your phone number
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Initial State - Before Code is Sent -->
        <div v-if="!codeSent" class="text-center space-y-6">
          <div>
            <p class="text-sm text-gray-600 mb-4">
              A 4-digit code will be sent to:<br>
              <span class="font-medium">{{ user.phone }}</span>
            </p>
          </div>

          <el-button
            type="primary"
            size="large"
            :loading="isSending"
            @click="handleSendCode"
          >
            Send Code Now
          </el-button>
        </div>

        <!-- After Code is Sent -->
        <div v-if="codeSent" class="space-y-6">
          <div>
            <label for="otp" class="block text-sm font-medium text-gray-700">
              Enter 4-digit code
            </label>
            <p class="text-xs text-gray-500 mt-1">
              Sent to {{ user.phone }}
            </p>
            <div class="mt-2">
              <el-input
                id="otp"
                v-model="otp"
                type="text"
                placeholder="••••"
                size="large"
                maxlength="4"
                @keyup.enter="verifyOtp"
              />
            </div>
          </div>

          <div class="flex justify-between items-center">
            <el-button
              type="primary"
              size="large"
              class="flex-1"
              :loading="isVerifying"
              @click="verifyOtp"
            >
              Verify
            </el-button>
          </div>

          <div class="text-center text-sm">
            <button
              type="button"
              class="font-medium text-primary-600 hover:text-primary-500 disabled:text-gray-400 disabled:cursor-not-allowed"
              :disabled="countdown > 0"
              @click="handleSendCode"
            >
              <span v-if="countdown > 0">Resend in {{ countdown }}s</span>
              <span v-else>Resend Code</span>
            </button>
          </div>
        </div>

        <div v-if="codeSent" class="mt-6 text-center text-sm text-gray-500">
          Didn't receive the code? Check your spam folder or request a new code above.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.el-input__inner) {
  letter-spacing: 0.5em;
  text-indent: 0.5em;
  font-family: monospace;
  font-size: 1.25rem;
  text-align: center;
}
</style>
