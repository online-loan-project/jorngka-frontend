import { ElMessage } from 'element-plus'
import FaceService from '~/services/FaceService.js'

const faceService = FaceService.getInstance()

export const useFaceVerifyStore = defineStore('face-verify', () => {
  const liveliness = ref(null)
  const nid = ref(null)

  //updateProfile function
  const faceVerify = async (payload) => {
    try {
      const { data } = await faceService.verify(payload)
      if (!data) {
        throw new Error('No data returned')
      }
      liveliness.value = data
      return data
    } catch (error) {
      ElMessage.error(error.message || 'Login failed')
      throw error
    }
  }

  const getLatestNidImage = async () => {
    try {
      const { data } = await faceService.getLatestNidImage()
      if (!data) {
        throw new Error('No data returned')
      }
      nid.value = data
      return data
    } catch (error) {
      ElMessage.error(error.message || 'Login failed')
      throw error
    }
  }

  const getLatestLivelinessImage = async () => {
    try {
      const { data } = await faceService.getLatestLivelinessImage()
      if (!data) {
        throw new Error('No data returned')
      }
      liveliness.value = data
      return data
    } catch (error) {
      ElMessage.error(error.message || 'Login failed')
      throw error
    }
  }

  return {
    liveliness: computed(() => liveliness.value),
    nid: computed(() => nid.value),
    faceVerify,
    getLatestNidImage,
    getLatestLivelinessImage,
  }
})
