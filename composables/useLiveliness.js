import { onMounted, ref } from 'vue'

export function useFaceDetection() {
  const videoElement = ref(null)
  const canvasElement = ref(null)
  const completedActionCount = ref(0)
  const actionInstruction = ref('Position your face in the circle')
  const successVisible = ref(false)
  const capturedImages = ref([])
  const showFacePositionHint = ref(true)
  const facePositionFeedback = ref('Move closer/farther until your face fits inside the circle')
  const showOverlay = ref(true)

  // Only 3 facial expression actions
  const actionSequence = [
    { text: 'Please smile', key: 'smile', threshold: 0.3 },
    { text: 'Please blink', key: 'blink', threshold: 0.2 },
  ]

  let currentActionIndex = -1
  let faceMesh = null
  let inference = null
  let canvasCtx = null
  let realLandmarks = []
  let faceInCircle = false
  let facePositionCheckCount = 0
  let normalEyebrowHeight = null // To store baseline eyebrow position

  onMounted(() => {
    if (typeof window !== 'undefined') {
      initFaceDetection()
    }
  })

  function closeFaceDetection() {
    if (inference) {
      inference.video.pause()
      inference.video.srcObject.getTracks().forEach(track => track.stop())
      inference.video.srcObject = null
    }
  }

  async function initFaceDetection() {
    const faceMeshModule = await import('@mediapipe/face_mesh')
    const { FaceMesh } = faceMeshModule

    if (!videoElement.value || !canvasElement.value) return

    canvasCtx = canvasElement.value.getContext('2d')

    faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `./resource/${file}`
      }
    })

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      useCpuInference: true
    })

    faceMesh.onResults(faceMeshResults)

    inference = new Inference(videoElement.value, {
      faceMeshInfer: async () => {
        await faceMesh.send({ image: videoElement.value })
      }
    })

    inference.start()
  }

  class Inference {
    constructor(video, info) {
      this.defaultInfo = {
        facingMode: 'user'
      }
      this.video = video
      this.elapsed_time = 0
      this.time = 0
      this.info = Object.assign(Object.assign({}, this.defaultInfo), info)
    }

    run(stream) {
      this.video.srcObject = stream
      this.video.onloadedmetadata = () => {
        this.video.play()
        this.captureStatus()
      }
    }

    captureStatus() {
      this.time++
      window.requestAnimationFrame(() => {
        this.forward()
      })
    }

    forward() {
      var faceMeshInfer = null
      this.video.paused || this.video.currentTime === this.elapsed_time ||
      (this.elapsed_time = this.video.currentTime, faceMeshInfer = this.info.faceMeshInfer())
      faceMeshInfer ? faceMeshInfer.then(() => {
        this.captureStatus()
      }) : this.captureStatus()
    }

    async start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: this.info.facingMode,
            width: this.info.width,
            height: this.info.height
          }
        })
        this.run(stream)
      } catch (error) {
        console.error('Failed to acquire camera feed:', error)
        throw error
      }
    }
  }

  function drawFaceCircle() {
    const canvas = canvasElement.value
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(canvas.width, canvas.height) * 0.4

    canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height)

    canvasCtx.globalCompositeOperation = 'destination-out'
    canvasCtx.beginPath()
    canvasCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    canvasCtx.fill()
    canvasCtx.globalCompositeOperation = 'source-over'

    canvasCtx.beginPath()
    canvasCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    canvasCtx.strokeStyle = faceInCircle ? '#4CAF50' : '#FF9800'
    canvasCtx.lineWidth = 4
    canvasCtx.stroke()

    canvasCtx.beginPath()
    canvasCtx.arc(centerX, centerY, radius * 0.7, 0, 2 * Math.PI)
    canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    canvasCtx.lineWidth = 2
    canvasCtx.stroke()

    facePositionFeedback.value = faceInCircle
      ? 'Perfect! Now follow the actions'
      : 'Center your face within the circle'
  }

  function checkFaceInCircle(landmarks) {
    if (!landmarks || landmarks.length === 0) return false

    const canvas = canvasElement.value
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(canvas.width, canvas.height) * 0.4

    const noseTip = landmarks[4]
    const faceX = noseTip[0] * canvas.width / 100
    const faceY = noseTip[1] * canvas.height / 100

    const distance = Math.sqrt(Math.pow(faceX - centerX, 2) + Math.pow(faceY - centerY, 2))
    const faceWidth = Math.abs(landmarks[234][0] - landmarks[454][0]) * canvas.width / 100
    const sizeValid = faceWidth > radius * 0.6 && faceWidth < radius * 1.2

    return distance < radius * 0.8 && sizeValid
  }

  async function faceMeshResults(results, isDraw = true) {
    if (window.innerWidth < 768) {
      isDraw = false
    }
    const { drawConnectors } = await import('@mediapipe/drawing_utils')
    const faceMeshModule = await import('@mediapipe/face_mesh')
    const {
      FACEMESH_FACE_OVAL,
      FACEMESH_LEFT_EYE,
      FACEMESH_LEFT_EYEBROW,
      FACEMESH_LEFT_IRIS,
      FACEMESH_LIPS,
      FACEMESH_RIGHT_EYE,
      FACEMESH_RIGHT_EYEBROW,
      FACEMESH_RIGHT_IRIS,
      FACEMESH_TESSELATION
    } = faceMeshModule

    canvasCtx.clearRect(0, 0, canvasElement.value.width, canvasElement.value.height)
    realLandmarks = []

    drawFaceCircle()

    if (results.multiFaceLandmarks) {
      const landmarks = results.multiFaceLandmarks[0]
      if (!landmarks) return

      for (const point of landmarks) {
        point.x = 1 - point.x
        realLandmarks.push([point.x * 100, point.y * 100 * (canvasElement.value.height / canvasElement.value.width)])
      }

      const currentFaceInCircle = checkFaceInCircle(realLandmarks)

      if (currentFaceInCircle !== faceInCircle) {
        facePositionCheckCount++
        if (facePositionCheckCount > 5) {
          faceInCircle = currentFaceInCircle
          facePositionCheckCount = 0
          if (faceInCircle) {
            showFacePositionHint.value = false
          }
        }
      } else {
        facePositionCheckCount = 0
      }

      if (!faceInCircle && currentActionIndex === -1) {
        actionInstruction.value = 'Position your face in the circle'
        showFacePositionHint.value = true
        return
      }

      if (isDraw) {
        drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 })
        drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, { color: '#FF3030' })
        drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, { color: '#FF3030' })
        drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_IRIS, { color: '#FF3030' })
        drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, { color: '#30FF30' })
        drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, { color: '#30FF30' })
        drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_IRIS, { color: '#30FF30' })
        drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, { color: '#E0E0E0' })
        drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, { color: '#E0E0E0' })
      }
    }

    if (currentActionIndex === -1 && faceInCircle) {
      currentActionIndex = 0
      actionInstruction.value = actionSequence[currentActionIndex].text
      return
    }

    if (!faceInCircle) return

    let actionCompleted = false
    const currentAction = actionSequence[currentActionIndex]

    switch (currentAction.key) {
      case 'smile':
        if (mouthAspectRatio(realLandmarks) > currentAction.threshold) {
          actionCompleted = true
        }
        break

      case 'blink':
        if (eyeAspectRatio(realLandmarks) < currentAction.threshold) {
          actionCompleted = true
        }
        break
    }

    if (actionCompleted && capturedImages.value.length < 3) {
      captureImage()
      completedActionCount.value += 1

      if (currentActionIndex < actionSequence.length - 1) {
        currentActionIndex++
        actionInstruction.value = actionSequence[currentActionIndex].text
        // Reset normal eyebrow height for next detection
        normalEyebrowHeight = null
      } else {
        successVisible.value = true
      }

      setTimeout(() => {}, 1000)
    }
  }

  function captureImage() {
    // Stop capturing if we already have 3 images
    if (capturedImages.value.length >= 3) {
      return
    }

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    canvas.width = videoElement.value.videoWidth
    canvas.height = videoElement.value.videoHeight

    context.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height)

    const imageData = canvas.toDataURL('image/png')
    capturedImages.value.push(imageData)

    // Also stop further actions if we've reached 3 images
    if (capturedImages.value.length >= 3) {
      successVisible.value = true
    }
  }

  // Helper functions
  function get2PointsNorm(p1, p2) {
    let sum = 0
    for (let index = 0; index < p1.length; index++) {
      sum += Math.pow(p1[index] - p2[index], 2)
    }
    return Math.sqrt(sum)
  }

  function get4PointsAspectRatio(points) {
    let v1 = get2PointsNorm(points[0], points[4])
    let h1 = get2PointsNorm(points[1], points[5])
    let h2 = get2PointsNorm(points[2], points[6])
    let h3 = get2PointsNorm(points[3], points[7])
    return (h1 + h2 + h3) / (3 * v1)
  }

  function eyeAspectRatio(landmarks) {
    let leftEyePoints = [landmarks[263], landmarks[385], landmarks[386], landmarks[387], landmarks[362], landmarks[380], landmarks[374], landmarks[373]]
    let leftEyeAspectRatio = get4PointsAspectRatio(leftEyePoints)

    let rightEyePoints = [landmarks[33], landmarks[160], landmarks[159], landmarks[158], landmarks[133], landmarks[144], landmarks[145], landmarks[153]]
    let rightEyeAspectRatio = get4PointsAspectRatio(rightEyePoints)
    return (leftEyeAspectRatio + rightEyeAspectRatio) / 2
  }

  function mouthAspectRatio(landmarks) {
    let topLipPoints = [landmarks[13], landmarks[14], landmarks[82], landmarks[81]]
    let bottomLipPoints = [landmarks[311], landmarks[308], landmarks[402], landmarks[291]]

    let verticalDistance = get2PointsNorm(topLipPoints[0], bottomLipPoints[0])
    let horizontalDistance = get2PointsNorm(topLipPoints[1], topLipPoints[2])
    return verticalDistance / horizontalDistance
  }

  return {
    videoElement,
    canvasElement,
    completedActionCount,
    actionInstruction,
    successVisible,
    capturedImages,
    showFacePositionHint,
    closeFaceDetection,
    facePositionFeedback,
    showOverlay
  }
}
