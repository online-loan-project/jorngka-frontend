import { defineStore } from 'pinia'
import InterestRateService from '~/services/InterestRateService.js'

export const useInterestRateStore = defineStore('interest-rate', () => {
  const rate = ref({})
  const interestRateService = InterestRateService.getInstance()

  const index = async (params) => {
    try {
      const { data } = await interestRateService.index(params)
      rate.value = data || {}
      return data
    } catch (error) {
      ElMessage.error(error.message || 'Get Request Loan failed')
      throw new Error(`Get Request Loan failed: ${error.message || 'Unknown error'}`)
    }
  }

  //store
  const store = async (params) => {
    try {
      const { data } = await interestRateService.store(params)
      rate.value = data || {}
      return data
    } catch (error) {
      ElMessage.error(error.message || 'Get Request Loan failed')
      throw new Error(`Get Request Loan failed: ${error.message || 'Unknown error'}`)
    }
  }

  return {
    rate: computed(() => rate.value),
    index,
    store
  }
})
