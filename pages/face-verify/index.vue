<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header with user info -->
      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Face Verification</h1>
            <p class="mt-2 text-gray-600">
              Compare your government ID photo with your live selfie for identity verification
            </p>
          </div>
          <div v-if="verificationResult" class="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <el-icon class="text-blue-500"><User /></el-icon>
            </div>
            <div>
              <div class="font-medium text-gray-800">{{ verificationResult.user.profile.first_name }} {{ verificationResult.user.profile.last_name }}</div>
              <div class="text-xs text-gray-500">ID: {{ verificationResult.nid.nid_number }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Verification status banner -->
      <div v-if="verificationStatus" class="mb-6">
        <el-alert
            :title="verificationStatus.title"
            :type="verificationStatus.type"
            :closable="false"
            class="!rounded-lg"
            show-icon
        >
          <template #default>
            <p class="text-sm">{{ verificationStatus.message }}</p>
            <div v-if="verificationStatus.actions" class="mt-2 flex gap-2">
              <el-button
                  v-for="(action, index) in verificationStatus.actions"
                  :key="index"
                  :type="action.type"
                  size="small"
                  @click="action.handler"
              >
                {{ action.text }}
              </el-button>
            </div>
          </template>
        </el-alert>
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
            <div class="flex items-center gap-2">
              <el-tag v-if="verificationResult" type="info" size="small">
                {{ verificationResult.nid.nid_number }}
              </el-tag>
              <el-tag v-if="verificationResult?.result.face_details?.source"
                      :type="verificationResult.result.face_details.source.Confidence > 90 ? 'success' : 'warning'"
                      size="small">
                {{ verificationResult.result.face_details.source.Confidence.toFixed(1) }}% confidence
              </el-tag>
              <el-button
                  v-if="!verificationResult"
                  type="primary"
                  size="small"
                  @click="navigateTo('nid-verify')"
                  class="!rounded-lg"
              >
                <el-icon class="mr-2"><Refresh /></el-icon>
                Re-Do NID Verify
              </el-button>
            </div>
          </div>

          <div class="aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center relative">
            <img
                v-if="verificationResult?.result.annotated_source_url"
                :src="verificationResult.result.annotated_source_url"
                alt="Annotated ID Document"
                class="object-contain w-full h-full"
            />
            <img
                v-else-if="nidImage"
                :src="nidImage.nid_image"
                alt="ID Document"
                class="object-contain w-full h-full"
            />
            <div v-else class="text-center p-4">
              <el-icon :size="48" class="text-gray-300 mb-2"><Picture /></el-icon>
              <p class="text-gray-400 text-sm">ID document image</p>
            </div>
            <div v-if="verificationResult" class="absolute inset-0 border-2 border-transparent"
                 :class="{
          'border-green-500': verificationResult?.result.verified,
          'border-red-500': !verificationResult?.result.verified
        }"></div>
          </div>

          <div v-if="verificationResult?.result.face_details?.source" class="mt-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="font-medium text-gray-800">Face Analysis</h3>
              <el-tooltip content="Annotated ID document" placement="top">
                <a :href="verificationResult?.result.annotated_source_url" target="_blank" class="text-xs text-blue-500 hover:underline flex items-center gap-1">
                  <el-icon :size="12"><View /></el-icon>
                  View annotated image
                </a>
              </el-tooltip>
            </div>

            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div class="text-gray-500 text-xs font-medium">Position</div>
                <div class="text-gray-800 font-mono">
                  X: {{ verificationResult.result.face_details.source.BoundingBox.Left.toFixed(3) }},
                  Y: {{ verificationResult.result.face_details.source.BoundingBox.Top.toFixed(3) }}
                </div>
              </div>
              <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div class="text-gray-500 text-xs font-medium">Size</div>
                <div class="text-gray-800 font-mono">
                  W: {{ verificationResult.result.face_details.source.BoundingBox.Width.toFixed(3) }},
                  H: {{ verificationResult.result.face_details.source.BoundingBox.Height.toFixed(3) }}
                </div>
              </div>
              <div class="bg-gray-50 p-3 rounded-lg border border-gray-100 col-span-2">
                <div class="text-gray-500 text-xs font-medium">Confidence</div>
                <div class="text-gray-800">
                  <el-progress
                      :percentage="verificationResult.result.face_details.source.Confidence"
                      :color="verificationResult.result.face_details.source.Confidence > 90 ? 'var(--el-color-success)' : 'var(--el-color-warning)'"
                      :show-text="false"
                  />
                  <div class="text-right text-xs mt-1">
                    {{ verificationResult.result.face_details.source.Confidence.toFixed(1) }}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Middle panel - Verification controls -->
        <div class="w-full lg:w-80 flex flex-col gap-4 md:gap-6">
          <!-- Verification control card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 flex flex-col items-center justify-center">
            <!-- Loading state -->
            <div v-if="isLoading && !verificationResult" class="w-full">
              <div class="text-center mb-4">
                <el-icon :size="48" class="text-gray-400 animate-spin"><Loading /></el-icon>
                <p class="mt-2 text-gray-500">Verifying faces...</p>
              </div>
              <el-skeleton :rows="2" animated />
            </div>

            <!-- Verification ready state -->
            <div v-if="!isLoading && !verificationResult" class="w-full text-center">
              <el-icon :size="48" class="text-blue-500"><Check /></el-icon>
              <h3 class="mt-3 font-medium text-gray-800">Ready to Verify</h3>
              <p class="mt-1 text-sm text-gray-500">Make sure both images are clear and visible</p>

              <div class="mt-6 bg-blue-50 p-4 rounded-lg text-left">
                <h4 class="text-sm font-medium text-blue-800 flex items-center gap-2">
                  <el-icon :size="16"><InfoFilled /></el-icon>
                  Verification Tips
                </h4>
                <ul class="mt-2 text-xs text-blue-600 space-y-2">
                  <li class="flex items-start gap-2">
                    <el-icon :size="12"><CircleCheck /></el-icon>
                    <span>Ensure both faces are clearly visible</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <el-icon :size="12"><CircleCheck /></el-icon>
                    <span>Check for good lighting and no glare</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <el-icon :size="12"><CircleCheck /></el-icon>
                    <span>Remove glasses or hats if possible</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <el-icon :size="12"><CircleCheck /></el-icon>
                    <span>Make sure the ID photo isn't blurry</span>
                  </li>
                </ul>
              </div>

              <el-button
                  type="primary"
                  @click="verifyFaces"
                  class="w-full mt-6 !rounded-lg"
                  :loading="isVerifying"
              >
                <span class="flex items-center gap-1">
                  <el-icon><Check /></el-icon>
                  Verify Now
                </span>
              </el-button>
            </div>

            <!-- Verification result display -->
            <div v-if="verificationResult" class="text-center w-full">
              <div class="relative">
                <el-icon :size="72" :color="verificationResult?.result.verified ? 'var(--el-color-success)' : 'var(--el-color-error)'">
                  <component :is="verificationResult?.result.verified ? 'CircleCheck' : 'CircleClose'" />
                </el-icon>
                <div
                    class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full border text-xs font-bold"
                    :class="verificationResult?.result.verified ? 'text-green-600 border-green-100' : 'text-red-600 border-red-100'"
                >
                  {{ verificationResult?.result.verified ? 'VERIFIED' : 'NOT VERIFIED' }}
                </div>
              </div>

              <div class="mt-6">
                <div class="text-3xl font-bold" :class="verificationResult?.result.verified ? 'text-green-600' : 'text-red-600'">
                  {{ verificationResult?.result.similarity_score.toFixed(1) }}%
                </div>
                <div class="text-sm text-gray-500 mt-1">Similarity Score</div>
                <div class="text-xs text-gray-400 mt-1">
                  (Threshold: {{ verificationResult?.result.threshold_used }}%)
                </div>
              </div>

              <!-- Verification details -->
              <div class="mt-4 pt-4 border-t border-gray-100 text-left">
                <div class="text-xs font-medium text-gray-500 mb-2">VERIFICATION DETAILS</div>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">ID Face Confidence</span>
                    <span class="font-medium">{{ verificationResult.result.face_details.source.Confidence.toFixed(1) }}%</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Selfie Confidence</span>
                    <span class="font-medium">{{ verificationResult.result.face_details.target.Confidence.toFixed(1) }}%</span>
                  </div>
                  <div class="flex flex-col justify-between">
                    <span class="text-gray-600 text-center">Verification Date</span>
                    <el-tag class="font-medium text-center" :type="verificationResult?.result.verified ? 'success' : 'danger'">
                      {{ formatDate(verificationResult.user.face_verified_at) }}
                    </el-tag>
                  </div>
                </div>
              </div>

              <!-- Pose analysis -->
              <div v-if="verificationResult?.result.face_details?.target?.Pose" class="mt-4 pt-4 border-t border-gray-100 text-left">
                <div class="text-xs font-medium text-gray-500 mb-2">POSE ANALYSIS</div>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Yaw</span>
                    <span class="font-mono">{{ verificationResult.result.face_details.target.Pose.Yaw.toFixed(1) }}°</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Pitch</span>
                    <span class="font-mono">{{ verificationResult.result.face_details.target.Pose.Pitch.toFixed(1) }}°</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Roll</span>
                    <span class="font-mono">{{ verificationResult.result.face_details.target.Pose.Roll.toFixed(1) }}°</span>
                  </div>
                </div>
              </div>

              <!-- Try again section for failed verification -->
              <div v-if="!verificationResult?.result.verified" class="mt-6 pt-4 border-t border-gray-100">
                <p class="text-sm text-gray-600 mb-3">The faces didn't match. Please try again :</p>
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
                    @click="retryVerification"
                    class="w-full !rounded-lg"
                >
                  <span class="flex items-center gap-1">
                    <el-icon><Refresh /></el-icon>
                    Try Again
                  </span>
                </el-button>
              </div>

              <!-- Success Button -->
              <div v-if="verificationResult?.result.verified" class="mt-6 pt-4 border-t border-gray-100">
                <el-button
                    type="primary"
                    @click="navigateTo('/dashboard')"
                    class="w-full !rounded-lg"
                >
                  <span class="flex items-center gap-1">
                    Continue to Dashboard
                    <el-icon><ArrowRight /></el-icon>
                  </span>
                </el-button>
              </div>
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
            <div class="flex items-center gap-2">
              <el-tag v-if="verificationResult" type="info" size="small">
                {{ formatDate(verificationResult.user.face_verified_at) }}
              </el-tag>
              <el-tag v-if="verificationResult?.result.face_details?.target"
                      :type="verificationResult.result.face_details.target.Confidence > 90 ? 'success' : 'warning'"
                      size="small">
                {{ verificationResult.result.face_details.target.Confidence.toFixed(1) }}% confidence
              </el-tag>

              <el-button
                  v-if="!verificationResult"
                  type="primary"
                  size="small"
                  @click="navigateTo('liveliness')"
                  class="!rounded-lg"
              >
                <el-icon class="mr-2"><Refresh /></el-icon>
                Re-Take Liveliness
              </el-button>
            </div>
          </div>

          <div class="aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center relative">
            <img
                v-if="verificationResult?.result.annotated_target_url"
                :src="verificationResult.result.annotated_target_url"
                alt="Annotated Live Selfie"
                class="object-contain w-full h-full"
            />
            <img
                v-else-if="livelinessImage"
                :src="livelinessImage.image"
                alt="Live Selfie"
                class="object-contain w-full h-full"
            />
            <div v-else class="text-center p-4">
              <el-icon :size="48" class="text-gray-300 mb-2"><Picture /></el-icon>
              <p class="text-gray-400 text-sm">Live selfie image</p>
            </div>
            <div v-if="verificationResult" class="absolute inset-0 border-2 border-transparent"
                 :class="{
          'border-green-500': verificationResult?.result.verified,
          'border-red-500': !verificationResult?.result.verified
        }"></div>
          </div>

          <div v-if="verificationResult?.result.face_details?.target" class="mt-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="font-medium text-gray-800">Face Analysis</h3>
              <el-tooltip content="Annotated selfie" placement="top">
                <a :href="verificationResult?.result.annotated_target_url" target="_blank" class="text-xs text-blue-500 hover:underline flex items-center gap-1">
                  <el-icon :size="12"><View /></el-icon>
                  View annotated image
                </a>
              </el-tooltip>
            </div>

            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div class="text-gray-500 text-xs font-medium">Position</div>
                <div class="text-gray-800 font-mono">
                  X: {{ verificationResult.result.face_details.target.BoundingBox.Left.toFixed(3) }},
                  Y: {{ verificationResult.result.face_details.target.BoundingBox.Top.toFixed(3) }}
                </div>
              </div>
              <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div class="text-gray-500 text-xs font-medium">Size</div>
                <div class="text-gray-800 font-mono">
                  W: {{ verificationResult.result.face_details.target.BoundingBox.Width.toFixed(3) }},
                  H: {{ verificationResult.result.face_details.target.BoundingBox.Height.toFixed(3) }}
                </div>
              </div>
              <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div class="text-gray-500 text-xs font-medium">Quality</div>
                <div class="text-gray-800">
                  <div>Brightness: {{ verificationResult.result.face_details.target.Quality.Brightness.toFixed(1) }}</div>
                  <div>Sharpness: {{ verificationResult.result.face_details.target.Quality.Sharpness.toFixed(1) }}</div>
                </div>
              </div>
              <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div class="text-gray-500 text-xs font-medium">Landmarks</div>
                <div class="flex flex-wrap gap-1 mt-1">
                  <el-tag v-for="landmark in verificationResult.result.face_details.target.Landmarks"
                          :key="landmark.Type" size="small" class="!text-xs">
                    {{ landmark.Type }}
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
  ArrowRight,
  View,
  InfoFilled
} from '@element-plus/icons-vue'
import { useFaceVerifyStore } from '~/store/face.js'

const faceStore = useFaceVerifyStore()
const { faceVerify, getLatestNidImage, getLatestLivelinessImage } = faceStore

definePageMeta({
  layout: 'default',
  middleware: ['authenticated', 'face-verification'],
})

const nidImage = ref(null)
const livelinessImage = ref(null)
const isLoading = ref(false)
const isVerifying = ref(false)
const verificationResult = ref(null)
const errorMessage = ref(null)
const verificationStatus = ref(null)

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const showStatus = (type, title, message, actions = []) => {
  verificationStatus.value = { type, title, message, actions }
}

const verifyFaces = async () => {
  try {
    isVerifying.value = true
    errorMessage.value = null

    if (!nidImage.value || !livelinessImage.value) {
      showStatus(
          'warning',
          'Images Missing',
          'Please make sure both ID and selfie images are loaded',
      )
      return
    }

    const payload = {
      id_card_image: nidImage.value.nid_image,
      face_image: livelinessImage.value.image,
    }

    verificationResult.value = await faceVerify(payload)

    if (verificationResult.value?.result.verified) {
      showStatus(
          'success',
          'Verification Successful',
          'Your identity has been successfully verified',
      )
    } else {
      showStatus(
          'error',
          'Verification Failed',
          'The faces didn\'t match. Please try again',
      )
    }
  } catch (error) {
    console.error('Verification error:', error)
    errorMessage.value = error.message || 'Face verification failed'
    showStatus(
        'error',
        'Verification Failed',
        error.message || 'An error occurred during verification',
    )
  } finally {
    isVerifying.value = false
    isLoading.value = false
  }
}

const retryVerification = () => {
  verificationResult.value = null
  fetchImages()
}

const fetchImages = async () => {
  try {
    isLoading.value = true
    errorMessage.value = null
    verificationResult.value = null
    verificationStatus.value = null

    const [nidResponse, livelinessResponse] = await Promise.all([
      getLatestNidImage(),
      getLatestLivelinessImage(),
    ])

    nidImage.value = nidResponse
    livelinessImage.value = livelinessResponse

    showStatus(
        'info',
        'Images Loaded',
        'Review your images and click Verify when ready',
    )
  } catch (error) {
    console.error('Error fetching images:', error)
    errorMessage.value = 'Failed to load verification images'
    showStatus(
        'error',
        'Loading Error',
        'Could not load ID or selfie images',
    )
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

/* Animation for verification status */
.verification-status-enter-active,
.verification-status-leave-active {
  transition: all 0.3s ease;
}
.verification-status-enter-from,
.verification-status-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>