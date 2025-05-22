import LivelinessService from '~/services/LivelinessService.js'
import { ElMessage } from 'element-plus'

const livelinessService = LivelinessService.getInstance()

export const useLivelinessStore = defineStore('liveliness-store', () => {
  const liveliness = ref(null)
  const nid = ref(null)

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
      throw error
    }
  }

  //storeNid
  const storeNid = async (params) => {
    try {
      const { data } = await livelinessService.storeNid(params)
      nid.value = data || {}
      return data
    } catch (error) {
      throw error
    }
  }

  return {
    liveliness: computed(() => liveliness.value),
    uploadLiveliness,
    storeNid,
  }
})
