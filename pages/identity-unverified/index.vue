<script setup>
import { User, Document } from '@element-plus/icons-vue'

useSeoMeta({
  title: 'JorngKa | Identity Verification Required',
  description: 'Complete your identity verification to access full account features with JorngKa.'
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <el-card class="max-w-md w-full text-center p-6 shadow-lg rounded-lg">
      <div class="flex justify-center space-x-4 mb-4">
        <el-icon size="50" class="text-blue-500">
          <User />
        </el-icon>
        <el-icon size="50" class="text-green-500">
          <Document />
        </el-icon>
      </div>
      <h1 class="text-2xl font-bold text-gray-700 mb-2">Identity Verification Required</h1>
      <p class="text-gray-600 mb-4">
        We need to verify your identity by matching your face with your National ID document.
      </p>

      <div class="text-left bg-blue-50 p-4 rounded-lg mb-4">
        <h3 class="font-semibold text-blue-700 mb-2">Verification Steps:</h3>
        <ol class="list-decimal list-inside space-y-2 text-gray-600">
          <li>Prepare your National ID card</li>
          <li>Ensure good lighting for face capture</li>
          <li>Follow the on-screen instructions</li>
          <li>Wait for verification results (usually within 1 hour)</li>
        </ol>
      </div>

      <div class="flex flex-col space-y-3 mt-4">
        <div>
          <el-button type="primary" class="w-full" @click="navigateTo('/nid-verify')">
            Start Verification
          </el-button>
        </div>
        <el-button class="w-full" @click="navigateTo('/contact')">
          Need Help?
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.el-card {
  background-color: white;
}
</style>