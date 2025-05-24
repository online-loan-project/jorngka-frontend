<script setup>
import { ref } from 'vue'
import { useFaceDetection } from '~/composables/useLiveliness.js'
import { onMounted, onUnmounted } from 'vue'
import { useLivelinessStore } from '~/store/liveliness.js'
import { useCookies } from 'vue3-cookies'
const { cookies } = useCookies()
const {
  videoElement,
  canvasElement,
  completedActionCount,
  actionInstruction,
  successVisible,
  capturedImages,
  closeFaceDetection,
  setupFaceDetection
} = useFaceDetection()

const isLoading = ref(false)
const errorMessage = ref(null)

const handleBeforeUnload = (e) => {
  if (capturedImages.value.length > 0) {
    e.preventDefault()
    e.returnValue = 'Are you sure you want to leave? Your verification progress may be lost.'
    return e.returnValue
  }
}

const livelinessStore = useLivelinessStore()
const { uploadLiveliness } = livelinessStore

const successButton = async () => {
  try {
    isLoading.value = true
    errorMessage.value = null

    window.removeEventListener('beforeunload', handleBeforeUnload)
    closeFaceDetection()

    if (!capturedImages.value?.length) {
      throw new Error('No images were captured. Please complete the verification steps.')
    }

    const formData = new FormData()

    const image = capturedImages.value[0] // only the first one

    if (image) {
      if (image instanceof Blob || image instanceof File) {
        formData.append('images[]', image)
      } else if (typeof image === 'string' && image.startsWith('data:image')) {
        const blob = await fetch(image).then(res => res.blob())
        formData.append('images[]', blob)
      } else {
        const blob = new Blob([image])
        formData.append('images[]', blob)
      }
    }

    const response = await uploadLiveliness(formData)

    if (!response.success) {
      throw new Error(response.message || 'Verification failed. Please try again.')
    }

    cookies.remove('access_token')
    cookies.remove('user')
    cookies.remove('tokenType')
    // Success handling
    setTimeout(() => navigateTo('/login'), 1000)

  } catch (error) {
    console.error('Liveliness verification failed:', error)
    errorMessage.value = error.message || 'An error occurred during verification'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  closeFaceDetection()
  capturedImages.value.forEach(img => {
    if (typeof img === 'string' && img.startsWith('blob:')) {
      URL.revokeObjectURL(img);
    }
  });
})
</script>

<template>
  <div class="face-detection-container">
    <!-- Camera Feed & Overlay Canvas -->
    <div class="flex flex-row">
      <div class="camera-wrapper">
        <video
          ref="videoElement"
          class="video-element"
          playsinline
          autoplay
          muted
          width="720px" height="560px"
        ></video>
        <canvas
          ref="canvasElement"
          class="detection-canvas"
          width="720px" height="560px"
        ></canvas>
      </div>

      <!-- Verification Panel with Captured Images -->
      <div class="verification-panel">
        <div>Biometric Verify Liveliness</div>
        <div class="verification-content">
          <h2 class="instruction-title">Follow the Instructions</h2>
          <div class="verification-progress">
            <div class="action-counter">{{ completedActionCount }}/3</div>
            <div class="progress-track">
              <div
                class="progress-bar"
                :style="{ width: `${(completedActionCount / 3) * 100}%` }"
              ></div>
            </div>
          </div>
          <p class="current-instruction">{{ actionInstruction }}</p>

          <!-- Success Message -->
          <div class="flex flex-col items-center">
            <div
              class="success-indicator"
              :class="{ visible: successVisible }"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Success! Verification complete.
            </div>
            <el-button v-if="successVisible" type="primary" @click="successButton">
              Success
            </el-button>
          </div>
        </div>

        <!-- Captured Images (now inside verification panel) -->
        <div v-if="capturedImages.length > 0" class="captured-images">
          <h3>Captured Images:</h3>
          <div class="image-grid">
            <div v-for="(image, index) in capturedImages" :key="index" class="image-preview">
              <img :src="image" alt="Captured face" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.face-detection-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background: #f0f4f8;
  overflow: hidden;
}

.flex.flex-row {
  display: flex;
  height: 100%;
  width: 100%;
  padding: 2rem;
  gap: 2rem;
  box-sizing: border-box;
}

.camera-wrapper {
  position: relative;
  width: 60%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Video element - maintains aspect ratio within container */
.video-element {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform: scaleX(-1);
  background: #000;
}

.detection-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.verification-panel {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.instruction-title {
  font-size: 1.5rem;
  color: #1a202c;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.current-instruction {
  font-size: 1.1rem;
  color: #4a5568;
  margin: 1.5rem 0;
  line-height: 1.5;
}

.verification-progress {
  margin: 1rem 0;
}

.action-counter {
  font-size: 1rem;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.progress-track {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4299e1, #48bb78);
  transition: width 0.3s ease;
}

/* Success Indicator */
.success-indicator {
  opacity: 0;
  height: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  color: #48bb78;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.success-indicator.visible {
  opacity: 1;
  height: auto;
  padding: 0.75rem;
}

.success-indicator svg {
  width: 1.5rem;
  height: 1.5rem;
}

/* Captured Images - now inside verification panel */
.captured-images {
  margin-top: auto;
  padding-top: 2rem;
}

.captured-images h3 {
  font-size: 1.1rem;
  color: #2d3748;
  margin-bottom: 1rem;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
}

.image-preview img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .flex.flex-row {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
    padding: 1rem;
  }

  .camera-wrapper {
    width: 100%;
    height: 60vh;
  }

  .verification-panel {
    width: 100%;
    overflow-y: visible;
  }
}

@media (max-width: 640px) {
  .camera-wrapper {
    height: 50vh;
  }

  .instruction-title {
    font-size: 1.3rem;
  }

  .current-instruction {
    font-size: 1rem;
  }

  .image-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
