<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8 text-center md:text-left">
        <h1 class="text-3xl font-bold text-gray-900">Face Verification</h1>
        <p class="mt-2 text-gray-600 max-w-2xl mx-auto md:mx-0">
          Compare your government ID photo with your live selfie for identity verification
        </p>
      </div>

      <!-- Main content - horizontal layout -->
      <div class="flex flex-col lg:flex-row gap-4 md:gap-6">
        <!-- Left panel - ID Card -->
        <div class="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg md:text-xl font-semibold flex items-center gap-2">
              <el-icon class="text-blue-500"><User /></el-icon>
              ID Document
            </h2>
            <el-tag v-if="verificationResult" :type="verificationResult.id_card_face.confidence > 0.7 ? 'success' : 'warning'" size="small">
              {{ (verificationResult.id_card_face.confidence * 100).toFixed(0) }}% confidence
            </el-tag>
          </div>

          <div class="aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center">
            <img
              v-if="nidImage"
              :src="nidImage.nid_image"
              alt="ID Document"
              class="object-contain w-full h-full"
            />
            <div v-else class="text-center p-4">
              <el-icon :size="48" class="text-gray-300 mb-2"><Picture /></el-icon>
              <p class="text-gray-400 text-sm">ID document image</p>
            </div>
          </div>

          <div v-if="verificationResult" class="mt-6 space-y-4">
            <h3 class="font-medium text-gray-800">Face Analysis</h3>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div class="text-gray-500 text-xs font-medium">Position</div>
                <div class="text-gray-800 font-mono">X: {{ verificationResult.id_card_face.x.toFixed(1) }}, Y: {{ verificationResult.id_card_face.y.toFixed(1) }}</div>
              </div>
              <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div class="text-gray-500 text-xs font-medium">Size</div>
                <div class="text-gray-800 font-mono">W: {{ verificationResult.id_card_face.width.toFixed(1) }}, H: {{ verificationResult.id_card_face.height.toFixed(1) }}</div>
              </div>
              <div class="bg-gray-50 p-3 rounded-lg border border-gray-100 col-span-2">
                <div class="text-gray-500 text-xs font-medium">Landmarks Detected</div>
                <div class="flex flex-wrap gap-1 mt-2">
                  <el-tag v-for="(_, key) in verificationResult.id_card_face.landmarks" :key="key" size="small" class="!text-xs">
                    {{ key.replace('_', ' ') }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Middle panel - Verification controls -->
        <div class="w-full lg:w-64 flex flex-col gap-4 md:gap-6">
          <!-- Verification button -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 flex flex-col items-center justify-center">
            <el-button
              type="primary"
              size="large"
              :loading="isLoading"
              :disabled="!nidImage || !livelinessImage"
              @click="verifyFaces"
              class="w-full !rounded-lg !h-12"
            >
              <template #loading>
                <span class="flex items-center gap-2">
                  <el-icon class="animate-spin"><Loading /></el-icon>
                  Verifying
                </span>
              </template>
              <span v-if="!isLoading" class="flex items-center gap-2 font-medium">
                <el-icon><Check /></el-icon>
                Verify Identity
              </span>
            </el-button>

            <!-- Verification result -->
            <div v-if="verificationResult" class="mt-6 text-center w-full">
              <div class="relative">
                <el-icon :size="72" :color="verificationResult.verified ? 'var(--el-color-success)' : 'var(--el-color-error)'">
                  <component :is="verificationResult.verified ? 'CircleCheck' : 'CircleClose'" />
                </el-icon>
                <div
                  class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full border text-xs font-bold"
                  :class="verificationResult.verified ? 'text-green-600 border-green-100' : 'text-red-600 border-red-100'"
                >
                  {{ verificationResult.verified ? 'VERIFIED' : 'NOT VERIFIED' }}
                </div>
              </div>

              <div class="mt-6">
                <div class="text-3xl font-bold" :class="verificationResult.verified ? 'text-green-600' : 'text-red-600'">
                  {{ (verificationResult.similarity_score * 100).toFixed(1) }}%
                </div>
                <div class="text-sm text-gray-500 mt-1">Similarity Score</div>
                <div class="text-xs text-gray-400 mt-1">
                  (Threshold: {{ (verificationResult.threshold_used * 100).toFixed(1) }}%)
                </div>
              </div>

              <!-- Try again section for failed verification -->
              <div v-if="!verificationResult.verified" class="mt-6 pt-4 border-t border-gray-100">
                <p class="text-sm text-gray-600 mb-3">The faces didn't match. Please try again with:</p>
                <ul class="text-xs text-gray-500 space-y-1 mb-4">
                  <li class="flex items-start gap-2">
                    <el-icon class="text-gray-400 mt-0.5"><CircleCheck /></el-icon>
                    <span>Better lighting conditions</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <el-icon class="text-gray-400 mt-0.5"><CircleCheck /></el-icon>
                    <span>Front-facing camera position</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <el-icon class="text-gray-400 mt-0.5"><CircleCheck /></el-icon>
                    <span>No glasses or face coverings</span>
                  </li>
                </ul>
                <el-button
                  type="primary"
                  plain
                  size="small"
                  @click="navigateTo('/liveliness')"
                  class="w-full !rounded-lg"
                >
                  <span class="flex items-center gap-1">
                    <el-icon><Refresh /></el-icon>
                    Try Again
                  </span>
                </el-button>
              </div>

              <!-- Success Button -->
              <div v-if="verificationResult.verified" class="mt-6 pt-4 border-t border-gray-100">
                <el-button
                    type="primary"
                    plain
                    size="small"
                    @click="navigateTo('/dashboard')"
                    class="w-full !rounded-lg"
                >
                  <span class="flex items-center gap-1">
                    Next
                    <el-icon><ArrowRight /></el-icon>
                  </span>
                </el-button>
              </div>

            </div>

            <!-- Loading state -->
            <div v-if="isLoading && !verificationResult" class="mt-6 w-full">
              <el-skeleton :rows="3" animated />
            </div>
          </div>

          <!-- Error display -->
          <el-alert
            v-if="errorMessage"
            :title="errorMessage"
            type="error"
            show-icon
            :closable="false"
            class="w-full !rounded-lg"
          >
            <template #default>
              <el-button
                type="danger"
                size="small"
                @click="fetchImages"
                class="mt-2 !rounded-lg"
              >
                <span class="flex items-center gap-1">
                  <el-icon><Refresh /></el-icon>
                  Retry
                </span>
              </el-button>
            </template>
          </el-alert>
        </div>

        <!-- Right panel - Selfie -->
        <div class="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg md:text-xl font-semibold flex items-center gap-2">
              <el-icon class="text-green-500"><Camera /></el-icon>
              Live Selfie
            </h2>
            <el-tag v-if="verificationResult" :type="verificationResult.face_photo.confidence > 0.7 ? 'success' : 'warning'" size="small">
              {{ (verificationResult.face_photo.confidence * 100).toFixed(0) }}% confidence
            </el-tag>
          </div>

          <div class="aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center">
            <img
              v-if="livelinessImage"
              :src="livelinessImage.image"
              alt="Live Selfie"
              class="object-contain w-full h-full"
            />
            <div v-else class="text-center p-4">
              <el-icon :size="48" class="text-gray-300 mb-2"><Picture /></el-icon>
              <p class="text-gray-400 text-sm">Live selfie image</p>
            </div>
          </div>

          <div v-if="verificationResult" class="mt-6 space-y-4">
            <h3 class="font-medium text-gray-800">Face Analysis</h3>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div class="text-gray-500 text-xs font-medium">Position</div>
                <div class="text-gray-800 font-mono">X: {{ verificationResult.face_photo.x.toFixed(1) }}, Y: {{ verificationResult.face_photo.y.toFixed(1) }}</div>
              </div>
              <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div class="text-gray-500 text-xs font-medium">Size</div>
                <div class="text-gray-800 font-mono">W: {{ verificationResult.face_photo.width.toFixed(1) }}, H: {{ verificationResult.face_photo.height.toFixed(1) }}</div>
              </div>
              <div class="bg-gray-50 p-3 rounded-lg border border-gray-100 col-span-2">
                <div class="text-gray-500 text-xs font-medium">Landmarks Detected</div>
                <div class="flex flex-wrap gap-1 mt-2">
                  <el-tag v-for="(_, key) in verificationResult.face_photo.landmarks" :key="key" size="small" class="!text-xs">
                    {{ key.replace('_', ' ') }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Refresh,
  User,
  Camera,
  Picture,
  Check,
  Loading,
  CircleCheck,
  CircleClose,
  ArrowRight
} from '@element-plus/icons-vue'
import { useFaceVerifyStore } from '~/store/face.js'

const faceStore = useFaceVerifyStore()
const { faceVerify, getLatestNidImage, getLatestLivelinessImage } = faceStore

definePageMeta({
  layout: 'default',
  middleware: ['authenticated'],
})

const nidImage = ref(null)
const livelinessImage = ref(null)
const isLoading = ref(false)
const verificationResult = ref(null)
const errorMessage = ref(null)

const verifyFaces = async () => {
  try {
    isLoading.value = true
    errorMessage.value = null
    verificationResult.value = null

    const payload = {
      id_card_image: nidImage.value.nid_image,
      face_image: livelinessImage.value.image,
    }

    verificationResult.value = await faceVerify(payload)
  } catch (error) {
    console.error('Verification error:', error)
    errorMessage.value = error.message || 'Face verification failed'
    ElNotification.error({
      title: 'Verification Failed',
      message: error.message || 'An error occurred during verification',
      position: 'bottom-right',
    })
  } finally {
    isLoading.value = false
  }
}

const fetchImages = async () => {
  try {
    isLoading.value = true
    errorMessage.value = null
    verificationResult.value = null

    const [nidResponse, livelinessResponse] = await Promise.all([
      getLatestNidImage(),
      getLatestLivelinessImage(),
    ])

    nidImage.value = nidResponse
    livelinessImage.value = livelinessResponse
  } catch (error) {
    console.error('Error fetching images:', error)
    errorMessage.value = 'Failed to load verification images'
    ElNotification.error({
      title: 'Loading Error',
      message: 'Could not load ID or selfie images',
      position: 'bottom-right',
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchImages()
})
</script>

<style scoped>
/* Smooth transitions for hover effects */
.bg-white {
  transition: all 0.2s ease;
}

/* Aspect ratio container */
.aspect-\[4\/3\] {
  position: relative;
  padding-bottom: 75%; /* 4:3 aspect ratio */
}

.aspect-\[4\/3\] > * {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Custom scrollbar for landmarks */
.tag-container {
  scrollbar-width: thin;
  scrollbar-color: var(--el-color-primary) var(--el-border-color-light);
}

.tag-container::-webkit-scrollbar {
  height: 4px;
}

.tag-container::-webkit-scrollbar-track {
  background: var(--el-border-color-light);
  border-radius: 2px;
}

.tag-container::-webkit-scrollbar-thumb {
  background-color: var(--el-color-primary);
  border-radius: 2px;
}
</style>