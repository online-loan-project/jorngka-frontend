<script setup>
import { onUnmounted, ref } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { useAuthStore } from '~/store/auth.js'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const user = useCookie('user').value

const authStore = useAuthStore()
const { sendCode, verifyCode } = authStore

const otp = ref('')
const isVerifying = ref(false)
const isSending = ref(false)
const countdown = ref(0)
const countdownInterval = ref(null)
const codeSent = ref(false)
const editablePhone = ref(user.phone) // Make phone number editable
const router = useRouter()
const otpDigits = ref(Array(4).fill(''))
const otpInputs = ref([])

const handleBack = () => {
  if (codeSent.value) {
    // If code was already sent, just go back to edit phone
    codeSent.value = false
  } else {
    // Otherwise navigate back to previous page
    router.go(-1)
  }
}

const handleSendCode = async () => {
  if (isSending.value || countdown.value > 0) return

  if (!editablePhone.value) {
    ElMessage.error('Please enter a valid phone number')
    return
  }

  isSending.value = true
  try {
    await sendCode({ phone: editablePhone.value }) // Pass the phone number to sendCode
    user.phone = editablePhone.value // Update the user's phone in cookie
    useCookie('user').value = user // Update the cookie with new phone number
    otp.value = '' // Clear the OTP input
    codeSent.value = true
    startCountdown()
    ElNotification({
      title: 'OTP Sent',
      message: `A 4-digit code has been sent to ${editablePhone.value}`,
      type: 'success',
      duration: 5000,
    })
  } catch (error) {
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
    const data = await verifyCode({ code: otp.value })
    //update phone_verified_at in cookie
    user.phone_verified_at = data.phone_verified_at
    useCookie('user').value = user // Update the cookie with new phone verification time

    ElNotification({
      title: 'Verified',
      message: 'Phone number verification successful!',
      type: 'success',
    })
    navigateTo('/nid-verify')
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

// Combine individual digits into the full OTP
watch(
  otpDigits,
  (newDigits) => {
    otp.value = newDigits.join('')
  },
  { deep: true },
)
const handleOtpInput = (index, event) => {
  const value = event.target.value

  // Only allow single digit
  if (value.length > 1) {
    otpDigits.value[index] = value.slice(0, 1)
    return
  }

  // Move to next input if a digit was entered
  if (value && index < 3) {
    otpInputs.value[index + 1].focus()
  }

  // Auto-submit if last digit entered
  if (index === 3 && value) {
    verifyOtp()
  }
}
const handleOtpDelete = (index, event) => {
  // If backspace pressed on empty field, move to previous input
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    otpInputs.value[index - 1].focus()
  }
}

const handlePaste = (event) => {
  const pasteData = event.clipboardData.getData('text/plain').trim()
  if (/^\d{4}$/.test(pasteData)) {
    otpDigits.value = pasteData.split('').slice(0, 4)
    verifyOtp()
  }
}
onUnmounted(() => {
  clearCountdown()
})
onMounted(() => {
  if (otpInputs.value[0]) {
    otpInputs.value[0].focus()
  }
  if (!user || !user.phone) {
    ElMessage.error('User information not found. Please log in again.')
    navigateTo('/login')
  }

//check if phone_verified_at exists
  if (user.phone_verified_at) {
    ElMessage.error('Your phone number is already verified.')
    navigateTo('/nid-verify')
  }
})
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
  >
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
              A 4-digit code will be sent to:
            </p>
            <el-input
              v-model="editablePhone"
              placeholder="Enter Phone"
              size="large"
              class="mb-4"
              @keyup.enter="handleSendCode"
            />
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
              <el-button
                type="text"
                size="small"
                @click="codeSent = false"
                class="ml-2"
              >
                Edit
              </el-button>
            </p>
            <div class="mt-2">
              <div class="flex justify-between space-x-2">
                <input
                  v-for="i in 4"
                  :key="i"
                  v-model="otpDigits[i - 1]"
                  type="number"
                  maxlength="1"
                  min="0"
                  max="9"
                  class="w-full h-16 text-3xl text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  @input="handleOtpInput(i - 1, $event)"
                  @keydown.delete="handleOtpDelete(i - 1, $event)"
                  @paste.prevent="handlePaste"
                  ref="otpInputs"
                />
              </div>
              <input type="hidden" id="otp" :value="otp" />
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
          Didn't receive the code?<br />
          Contact support or try again later.
        </div>
      </div>
      <div class="flex justify-center mt-4">
        <el-button
          type="text"
          :icon="ArrowLeft"
          @click="handleBack"
          class="text-gray-600 hover:text-gray-900"
        >
          Back
        </el-button>
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
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>