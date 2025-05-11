import LivelinessService from '~/services/LivelinessService.js'
import { ElMessage } from 'element-plus'

const livelinessService = LivelinessService.getInstance()

export const useLivelinessStore = defineStore('liveliness', () => {
  const liveliness = ref(null)

  //updateProfile function
  const uploadLiveliness = async (req) => {
    try {
      const { data } = await livelinessService.liveliness(req)
      if (!data) {
        throw new Error('No data returned')
      }
      liveliness.value = data
      return data
    } catch (error) {
      ElMessage.error(error.message || 'Login failed')
      throw new Error(`Login failed: ${error.message || 'Unknown error'}`)
    }
  }

  return {
    liveliness: computed(() => liveliness.value),
    uploadLiveliness
  }
})
