import { defineStore } from 'pinia'
import AdminCreditService from '~/services/Admin/AdminCreditService.js'

export const useAdminCreditStore = defineStore('admin_request_loans', () => {
  const requestLoan = ref({})
  const adminCreditService = AdminCreditService.getInstance()

  const index = async (params) => {
    try {
      const { data } = await adminCreditService.index(params)
      requestLoan.value = data || {}
      return data
    } catch (error) {
      ElMessage.error(error.message || 'Get Loan failed')
      throw new Error(`Get Loan failed: ${error.message || 'Unknown error'}`)
    }
  }

  //deposit
  const deposit = async (payload) => {
    try {
      const { data } = await adminCreditService.deposit(payload)
      return data
    } catch (error) {
      throw error
    }
  }

  //withdraw
  const withdraw = async (payload) => {
    try {
      const { data } = await adminCreditService.withdraw(payload)
      return data
    } catch (error) {
      throw error
    }
  }

  return {
    RequestLoan: computed(() => requestLoan.value),
    index,
    deposit,
    withdraw
  }
})
