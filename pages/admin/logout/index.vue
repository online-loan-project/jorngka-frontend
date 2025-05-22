<script setup>
import { useAuthStore } from '~/store/auth.js'

definePageMeta({
  layout: 'admin',
  middleware: ['authenticated'],
})

const authStore = useAuthStore()
const { logout } = authStore

const userLogout = async () => {
  try {
    await logout()
    navigateTo('/login')
  } catch (error) {
    ElMessage.error('Logout failed. Please try again.')
  }
}
</script>

<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4"
  >
    <div class="w-full max-w-md bg-white rounded-lg shadow-md p-8 space-y-6">
      <div class="text-center">
        <el-icon class="text-5xl text-blue-500 mb-4" :size="50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z"
              clip-rule="evenodd"
            />
          </svg>
        </el-icon>
        <h1 class="text-2xl font-bold text-gray-800">Logging Out</h1>
        <p class="text-gray-600 mt-2">You're being securely logged out...</p>
      </div>

      <div class="flex justify-center">
        <el-progress
          :percentage="100"
          :indeterminate="true"
          :show-text="false"
        />
      </div>

      <div class="text-center mt-6">
        <div>
          <el-button type="primary" @click="userLogout" class="w-full">
            Log Out
          </el-button>
        </div>

        <el-button @click="() => navigateTo('/dashboard')" class="w-full mt-4">
          Cancel
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* You can add custom styles here if needed */
</style>
