<script setup>
import { useLivelinessStore } from '~/store/liveliness.js'
import { ElMessage, ElUpload, ElButton, ElInput, ElAlert, ElProgress } from 'element-plus'

definePageMeta({
  layout: 'default',
  middleware: ['authenticated'],
})

const user = useCookie('user').value

const livelinessStore = useLivelinessStore()
const { storeNid } = livelinessStore

const nidData = ref({
  nidNumber: '',
  nidFirstName: '',
  nidLastName: '',
  nidImage: null,
})

const nidPreview = ref({
  image: null,
})

const isSubmitNid = ref(true)
const isLoading = ref(false)
const uploadProgress = ref(0)
const errors = ref({
  general: null,
  nidImage: null
})

const handleFileUpload = (file) => {
  // Reset previous errors
  errors.value.nidImage = null
  errors.value.general = null

  if (!file.type.match('image.*')) {
    errors.value.nidImage = 'Please upload an image file (JPG, PNG)'
    return false
  }

  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    errors.value.nidImage = 'File size should not exceed 5MB'
    return false
  }

  const reader = new FileReader()

  reader.onload = (e) => {
    nidData.value.nidImage = file
    nidPreview.value.image = e.target.result
  }

  reader.onerror = () => {
    errors.value.nidImage = 'Error reading file. Please try again.'
  }

  reader.readAsDataURL(file)
  return true
}

const submitNid = async () => {
  // Reset previous errors
  errors.value.general = null

  if (!nidData.value.nidImage) {
    errors.value.general = 'Please upload an NID image first'
    return
  }

  isLoading.value = true
  uploadProgress.value = 0

  // Simulate upload progress (replace with actual progress events if your API supports it)
  const progressInterval = setInterval(() => {
    if (uploadProgress.value < 90) {
      uploadProgress.value += 10
    }
  }, 300)

  try {
    const formData = new FormData()
    formData.append('nid_image', nidData.value.nidImage)

    const respond = await storeNid(formData)
    nidData.value.nidNumber = respond.nid_number
    nidData.value.nidFirstName = respond.first_name
    nidData.value.nidLastName = respond.last_name
    uploadProgress.value = 100
    ElMessage.success('NID verification submitted successfully!')
    isSubmitNid.value = false
  } catch (error) {
    errors.value.general = error || 'An error occurred during verification'
    ElMessage.error(errors.value.general)
  } finally {
    clearInterval(progressInterval)
    isLoading.value = false
  }
}

onMounted(() => {
  if (user.face_verified_at) {
    ElMessage.error('Your idenity is already verified.')
    navigateTo('/dashboard')
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <!-- Header with progress indicator -->
      <div class="bg-blue-600 px-6 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-bold text-white">Identity Verification</h1>
        </div>
      </div>

      <div class="p-6 md:p-8">
        <!-- Main content -->
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">National ID Verification</h2>
          <p class="mt-2 text-gray-600">Upload a clear photo of your National ID card</p>
        </div>

        <!-- Error alerts -->
        <template v-if="errors.general || errors.nidImage">
          <el-alert
            v-if="errors.general"
            :title="errors.general"
            type="error"
            show-icon
            class="mb-4"
            @close="errors.general = null"
          />
          <el-alert
            v-if="errors.nidImage"
            :title="errors.nidImage"
            type="error"
            show-icon
            class="mb-4"
            @close="errors.nidImage = null"
          />
        </template>

        <!-- Upload section -->
        <div v-if="isSubmitNid" class="space-y-6">
          <div class="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
            <div class="flex items-start">
              <div class="flex-shrink-0 p-2 bg-blue-100 rounded-full">
                <svg class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-3">
                <h4 class="font-medium text-blue-800 mb-1">Verification Guidelines</h4>
                <ul class="text-sm text-blue-600 list-disc pl-5 space-y-1">
                  <li>Ensure all details are clearly visible</li>
                  <li>Take photo in well-lit environment</li>
                  <li>Avoid glare and shadows on the document</li>
                  <li>Upload high-resolution images (minimum 800px width)</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">NID Card Image</label>
            <el-upload
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="(file) => handleFileUpload(file.raw)"
              accept="image/*"
              class="upload-demo"
              :class="{ 'border-red-300': errors.nidImage }"
            >
              <div v-if="!nidPreview.image" class="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors cursor-pointer bg-gray-50">
                <div class="flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p class="mt-2 text-sm text-gray-600">
                  <span class="text-blue-600 font-medium">Click to upload</span> or drag and drop
                </p>
                <p class="mt-1 text-xs text-gray-500">JPG, PNG (Max 5MB)</p>
              </div>
              <div v-else class="relative group">
                <img
                  :src="nidPreview.image"
                  alt="NID Preview"
                  class="w-full h-64 object-contain mx-auto rounded-md border border-gray-200"
                />
                <div class="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    class="bg-white rounded-full p-2 text-gray-700 hover:text-blue-600"
                    @click.stop="nidPreview.image = null; nidData.nidImage = null"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </el-upload>
          </div>

          <!-- Upload progress -->
          <div v-if="isLoading" class="mt-4">
            <div class="flex justify-between text-sm text-gray-600 mb-1">
              <span>Uploading...</span>
            </div>
            <el-progress
              :percentage="uploadProgress"
              :stroke-width="6"
              color="#3b82f6"
            />
          </div>

          <div class="pt-4">
            <el-button
              type="primary"
              :loading="isLoading"
              @click="submitNid"
              class="w-full py-3 text-base font-medium"
              :disabled="!nidData.nidImage"
            >
              {{ isLoading ? 'Verifying...' : 'Verify NID' }}
            </el-button>
          </div>
        </div>

        <!-- Verification success section -->
        <div v-else class="space-y-6">
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 class="mt-3 text-lg font-medium text-gray-900">Verification Successful</h2>
            <p class="mt-1 text-sm text-gray-600">Your NID details have been verified</p>
          </div>

          <div class="border-t border-b border-gray-200 py-6">
            <div class="flex justify-center">
              <img
                :src="nidPreview.image"
                alt="NID Preview"
                class="h-48 object-contain rounded-md border border-gray-200 shadow-sm"
              />
            </div>
          </div>

          <div class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <label class="block text-sm font-medium text-gray-500 mb-1">NID Number</label>
              <div class="text-lg font-semibold text-gray-800">{{ nidData.nidNumber || 'Not available' }}</div>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-500 mb-1">First Name</label>
                <div class="text-lg font-semibold text-gray-800">{{ nidData.nidFirstName || 'Not available' }}</div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
                <div class="text-lg font-semibold text-gray-800">{{ nidData.nidLastName || 'Not available' }}</div>
              </div>
            </div>
          </div>

          <div class="pt-4">
            <el-button
              type="primary"
              @click="navigateTo('/liveliness')"
              class="w-full py-3 text-base font-medium"
            >
              Continue to Face Verification
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2 -mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.upload-demo .el-upload {
  @apply w-full;
}

.upload-demo .el-upload-dragger {
  @apply w-full p-0 border-none;
}

/* Animation for success checkmark */
@keyframes checkmark {
  0% {
    stroke-dashoffset: 50px;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.checkmark-animate {
  animation: checkmark 0.6s ease-in-out forwards;
}
</style>
