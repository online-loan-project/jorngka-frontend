import { FaceMesh } from '@mediapipe/face_mesh'
import { drawConnectors } from '@mediapipe/drawing_utils'

export default defineNuxtPlugin((nuxtApp) => {
  return {
    provide: {
      FaceMesh: FaceMesh,
      drawingUtils: { drawConnectors }
    }
  }
})
