import { defineStore } from 'pinia'
import LoanService from '~/services/LoanService.js'

export const useLoanStore = defineStore('loans', () => {
  const requestLoan = ref({})
  const loanService = LoanService.getInstance()

  const getLoan = async (params) => {
    try {
      const { data } = await loanService.index(params)
      requestLoan.value = data || {}
      return data
    } catch (error) {
      ElMessage.error(error.message || 'Get Request Loan failed')
      throw new Error(`Get Request Loan failed: ${error.message || 'Unknown error'}`)
    }
  }

  return {
    RequestLoan: computed(() => requestLoan.value),
    getLoan,
  }
})
