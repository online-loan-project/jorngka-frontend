import { onMounted, ref } from 'vue'

export function useFaceDetection() {
  const videoElement = ref(null)
  const canvasElement = ref(null)
  const completedActionCount = ref(0)
  const actionInstruction = ref('Please wait...')
  const successVisible = ref(false)
  const capturedImages = ref([])

  const actionType = {
    0: 'Please blink',
    1: 'Please open your mouth',
    2: 'Please shake your head',
    3: 'Please nod'
  }

  let currentActionType = -1
  let faceMesh = null
  let inference = null
  let canvasCtx = null
  let realLandmarks = []

  onMounted(() => {
    // Only initialize if running in a browser
    if (typeof window !== 'undefined') {
      initFaceDetection()
    }
  })

  //close FaceDection
  function closeFaceDetection() {
    //close webcam
    if (inference) {
      inference.video.pause()
      inference.video.srcObject.getTracks().forEach(track => track.stop())
      inference.video.srcObject = null
    }
  }

  async function initFaceDetection() {
    const faceMeshModule = await import('@mediapipe/face_mesh')
    const {
      FaceMesh
    } = faceMeshModule

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

  async function faceMeshResults(results, isDraw = true) {
    //if mobile device set isDraw to false
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

    if (results.multiFaceLandmarks) {
      const landmarks = results.multiFaceLandmarks[0]
      if (!landmarks) return

      for (const point of landmarks) {
        point.x = 1 - point.x  // Flip Horizontal
        realLandmarks.push([point.x * 100, point.y * 100 * (canvasElement.value.height / canvasElement.value.width)])
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

    if (currentActionType == -1) {
      currentActionType = Math.floor(Math.random() * 4)
      actionInstruction.value = actionType[currentActionType]
    }

    let flag = false

    if (currentActionType == 0) {
      if (eyeAspectRation(realLandmarks) < 0.2) {
        flag = true
      }
    } else if (currentActionType == 1) {
      if (mouthAspectRatio(realLandmarks) > 0.6) {
        flag = true
      }
    } else if (currentActionType == 2) {
      let points = getPoint5(realLandmarks)
      let angle = getPoint5Angle(points)
      if ((angle[2] < -90 || angle[2] > 90) && (angle[1] > -30 && angle[1] < 30)) {
        flag = true
      }
    } else if (currentActionType == 3) {
      let points = getPoint5(realLandmarks)
      let angle = getPoint5Angle(points)
      if ((angle[1] < -30 || angle[1] > 30) && (angle[2] > -30 && angle[2] < 30)) {
        flag = true
      }
    }

    if (flag) {
      currentActionType = -1
      actionInstruction.value = 'Please wait...'

      if (completedActionCount.value >= 3) {
        successVisible.value = true
      } else {
        captureImage()
        completedActionCount.value += 1
      }

      setTimeout(() => {
        actionInstruction.value = actionType[currentActionType]
      }, 2000)
    }
  }

  function captureImage() {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    canvas.width = videoElement.value.videoWidth
    canvas.height = videoElement.value.videoHeight

    context.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height)

    const imageData = canvas.toDataURL('image/png')
    capturedImages.value.push(imageData)
  }

  // Helper functions (unchanged from original)
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

  function eyeAspectRation(landmarks) {
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

  function getPoint5(landmarks) {
    let point5 = []
    point5.push(landmarks[468])
    point5.push(landmarks[473])
    point5.push(landmarks[4])
    point5.push(landmarks[61])
    point5.push(landmarks[291])
    return point5
  }

  function getPoint5Angle(points) {
    let LMx = []
    let LMy = []
    for (let index = 0; index < points.length; index++) {
      LMx.push(points[index][0])
      LMy.push(points[index][1])
    }

    let dPx_eyes = Math.max((LMx[1] - LMx[0]), 1.0)
    let dPy_eyes = LMy[1] - LMy[0]
    let angle = Math.atan(dPy_eyes / dPx_eyes)

    let alpha = Math.cos(angle)
    let beta = Math.sin(angle)

    let LMRx = []
    let LMRy = []
    for (let index = 0; index < points.length; index++) {
      LMRx.push(alpha * LMx[index] + beta * LMy[index] + (1 - alpha) * LMx[2] / 2 - beta * LMy[2] / 2)
      LMRy.push(-beta * LMx[index] + alpha * LMy[index] + beta * LMx[2] / 2 + (1 - alpha) * LMy[2] / 2)
    }

    let dXtot = (LMRx[1] - LMRx[0] + LMRx[4] - LMRx[3]) / 2
    let dYtot = (LMRy[3] - LMRy[0] + LMRy[4] - LMRy[1]) / 2

    let dXnose = (LMRx[1] - LMRx[2] + LMRx[4] - LMRx[2]) / 2
    let dYnose = (LMRy[3] - LMRy[2] + LMRy[4] - LMRy[2]) / 2

    let Xfrontal = dXtot != 0 ? (-90 + 90 / 0.5 * dXnose / dXtot) : 0
    let Yfrontal = dYtot != 0 ? (-90 + 90 / 0.5 * dYnose / dYtot) : 0

    let roll = angle * 180 / Math.PI
    let pitch = Yfrontal
    let yaw = Xfrontal

    return [roll, pitch, yaw]
  }

  return {
    videoElement,
    canvasElement,
    completedActionCount,
    actionInstruction,
    successVisible,
    capturedImages,
    closeFaceDetection
  }
}
