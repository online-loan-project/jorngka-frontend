import { defineStore } from 'pinia'
import AdminLoanService from '~/services/Admin/AdminLoanService.js'

export const useAdminLoanStore = defineStore('admin_loans', () => {
  const requestLoan = ref({})
  const adminLoanService = AdminLoanService.getInstance()

  const getLoan = async (params) => {
    try {
      const { data } = await adminLoanService.index(params)
      requestLoan.value = data || {}
      return data
    } catch (error) {
      ElMessage.error(error.message || 'Get Loan failed')
      throw new Error(`Get Loan failed: ${error.message || 'Unknown error'}`)
    }
  }

  //paid
  const paid = async (repaymentId) => {
    try {
      const { data } = await adminLoanService.paid(repaymentId)
      return data
    } catch (error) {
      ElMessage.error(error.message || 'Paid failed')
      throw new Error(`Paid failed: ${error.message || 'Unknown error'}`)
    }
  }

  return {
    RequestLoan: computed(() => requestLoan.value),
    getLoan,
    paid
  }
})
