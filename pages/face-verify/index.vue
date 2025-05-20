  <template>
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Face Verification</h1>
          <p class="mt-2 text-sm text-gray-600">
            Verify your identity by comparing your NID photo with your live selfie
          </p>
        </div>

        <!-- Loading State -->
        <el-skeleton :loading="isLoading && !nidImage && !livelinessImage" animated>
          <template #template>
            <div class="flex flex-col sm:flex-row gap-6 mb-8">
              <div class="flex-1">
                <el-skeleton-item variant="image" class="h-80 w-full" />
                <el-skeleton-item variant="text" class="w-1/2 mt-2" />
              </div>
              <div class="flex-1">
                <el-skeleton-item variant="image" class="h-80 w-full" />
                <el-skeleton-item variant="text" class="w-1/2 mt-2" />
              </div>
            </div>
          </template>
        </el-skeleton>

        <!-- Error State -->
        <el-alert
          v-if="errorMessage"
          :title="errorMessage"
          type="error"
          :closable="false"
          class="mb-6"
        >
          <template #default>
            <el-button
              type="danger"
              size="small"
              @click="fetchImages"
              class="mt-2"
            >
              Retry
            </el-button>
          </template>
        </el-alert>

        <!-- Images Container -->
        <div v-if="!isLoading || nidImage || livelinessImage" class="flex flex-col sm:flex-row gap-6 mb-8">
          <!-- NID Image -->
          <div class="flex-1 bg-white p-4 rounded-lg shadow">
            <h2 class="text-lg font-medium text-gray-900 mb-4 text-center">
              NID Photo
            </h2>
            <div class="flex justify-center items-center bg-gray-100 rounded-md overflow-hidden h-80">
              <img
                v-if="nidImage"
                :src="nidImage.nid_image"
                alt="NID Photo"
                class="object-contain h-full w-full"
              />
              <el-empty v-else description="No NID image available" :image-size="80" />
            </div>
          </div>

          <!-- Selfie Image -->
          <div class="flex-1 bg-white p-4 rounded-lg shadow">
            <h2 class="text-lg font-medium text-gray-900 mb-4 text-center">
              Selfie Photo
            </h2>
            <div class="flex justify-center items-center bg-gray-100 rounded-md overflow-hidden h-80">
              <img
                v-if="livelinessImage"
                :src="livelinessImage.image"
                alt="Selfie Photo"
                class="object-contain h-full w-full"
              />
              <el-empty v-else description="No selfie image available" :image-size="80" />
            </div>
          </div>
        </div>

        <!-- Verify Button -->
        <div class="text-center mb-8">
          <el-button
            type="primary"
            size="large"
            :loading="isLoading"
            :disabled="!nidImage || !livelinessImage"
            @click="verifyFaces"
            class="w-full sm:w-64"
          >
            {{ isLoading ? 'Verifying...' : 'Verify Faces' }}
          </el-button>
        </div>

        <!-- Results Section -->
        <div v-if="verificationResult" class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-semibold text-gray-900 mb-4 text-center">
            Verification Result
          </h2>
          <div
            class="text-center py-4 rounded-md mb-4"
            :class="{
              'bg-green-50 text-green-800': verificationResult.match,
              'bg-red-50 text-red-800': !verificationResult.match
            }"
          >
            <el-icon
              :size="32"
              :color="verificationResult.match ? 'var(--el-color-success)' : 'var(--el-color-error)'"
              class="mb-2"
            >
              <component :is="verificationResult.match ? 'CircleCheck' : 'CircleClose'" />
            </el-icon>
            <p class="text-lg font-medium">
              {{ verificationResult.match ? 'Match Verified' : 'No Match Found' }}
            </p>
            <p
              v-if="verificationResult.confidence"
              class="mt-2 text-sm text-gray-600"
            >
              Confidence: {{ (verificationResult.confidence * 100).toFixed(2) }}%
            </p>
          </div>

          <div v-if="!verificationResult.match" class="text-center mt-4">
            <el-button type="warning" @click="verifyFaces">Try Again</el-button>
          </div>
        </div>
      </div>
    </div>
  </template>

  <script setup>
  import { useFaceVerifyStore } from '~/store/face.js'
  const faceStore = useFaceVerifyStore()
  const { faceVerify, getLatestNidImage, getLatestLivelinessImage } = faceStore

  const nidImage = ref(null)
  const livelinessImage = ref(null)
  const isLoading = ref(false)
  const verificationResult = ref(null)
  const errorMessage = ref(null)
  const nidBlob = ref(null)
  const livelinessBlob = ref(null)

  const verifyFaces = async () => {
    try {
      isLoading.value = true
      errorMessage.value = null
      verificationResult.value = null

      const payload = {
        nid: nidImage.value.nid_image,
        liveliness: livelinessImage.value.image
      }
      // Call the verification API
      const result = await faceVerify(payload)
      verificationResult.value = result
    } catch (error) {
      console.error('Error during verification:', error)
      errorMessage.value = error.message || 'Face verification failed'
      ElNotification.error({
        title: 'Verification Failed',
        message: error.message || 'An error occurred during face verification'
      })
    } finally {
      isLoading.value = false
    }
  }

  const fetchImages = async () => {
    try {
      isLoading.value = true
      errorMessage.value = null

      // Fetch NID image first
      nidImage.value = await getLatestNidImage()

      // Then fetch liveliness image
      livelinessImage.value = await getLatestLivelinessImage()

    } catch (error) {
      console.error('Error fetching images:', error)
      errorMessage.value = 'Failed to load images'
      ElNotification.error({
        title: 'Loading Failed',
        message: 'Failed to load images from server'
      })
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    fetchImages()
  })

  onUnmounted(() => {
    if (nidImage.value?.nid_image) {
      URL.revokeObjectURL(nidImage.value.nid_image)
    }
    if (livelinessImage.value?.image) {
      URL.revokeObjectURL(livelinessImage.value.image)
    }
  })
  </script>

  <style scoped>
  /* Custom transitions */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  </style>
