import { defineStore } from 'pinia'
import CreditScoreService from '~/services/CreditScoreService.js'

export const useCreditScoreStore = defineStore('credit-score', () => {
  const creditScore = ref({})
  const creditScoreService = CreditScoreService.getInstance()

  const index = async (params) => {
    try {
      const { data } = await creditScoreService.index(params)
      creditScore.value = data || {}
      return data
    } catch (error) {
      ElMessage.error(error.message || 'Get Credit Score failed')
      throw new Error(`Get Credit Score failed: ${error.message || 'Unknown error'}`)
    }
  }

  //store
  const reset = async (params, req) => {
    try {
      const { data } = await creditScoreService.reset(params, req)
      creditScore.value = data || {}
      return data
    } catch (error) {
      ElMessage.error(error.message || 'Reset Credit Score failed')
      throw new Error(`Reset Credit Score failed: ${error.message || 'Unknown error'}`)
    }
  }

  //update
  const update = async (user_id, params) => {
    try {
      const { data } = await creditScoreService.update(user_id, params)
      creditScore.value = data || {}
      return data
    } catch (error) {
      ElMessage.error(error.message || 'Update Credit Score failed')
      throw new Error(`Update Credit Score failed: ${error.message || 'Unknown error'}`)
    }
  }

  return {
    creditScore: computed(() => creditScore.value),
    index,
    reset,
    update
  }
})
