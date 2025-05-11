import { defineStore } from 'pinia'
import AdminRequestLoanService from '~/services/Admin/AdminRequestLoanService.js'

export const useAdminRequestLoanStore = defineStore('admin_request_loans', () => {
  const requestLoan = ref({})
  const adminRequestLoanService = AdminRequestLoanService.getInstance()

  const index = async (params) => {
    try {
      const { data } = await adminRequestLoanService.index(params)
      requestLoan.value = data || {}
      return data
    } catch (error) {
      ElMessage.error(error.message || 'Get Loan failed')
      throw new Error(`Get Loan failed: ${error.message || 'Unknown error'}`)
    }
  }

  //approve
  const approve = async (id) => {
    try {
      const { data } = await adminRequestLoanService.approve(id)
      return data
    } catch (error) {
      ElMessage.error(error.message || 'Approve Loan failed')
      throw new Error(`Approve Loan failed: ${error.message || 'Unknown error'}`)
    }
  }

  //reject
  const reject = async (id, payload) => {
    try {
      const { data } = await adminRequestLoanService.reject(id, payload)
      return data
    } catch (error) {
      ElMessage.error(error.message || 'Reject Loan failed')
      throw new Error(`Reject Loan failed: ${error.message || 'Unknown error'}`)
    }
  }

  return {
    RequestLoan: computed(() => requestLoan.value),
    index,
    approve,
    reject,
  }
})
