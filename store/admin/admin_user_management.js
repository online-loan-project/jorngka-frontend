import { defineStore } from 'pinia'
import AdminUserManagementService from '~/services/Admin/AdminUserManagementService.js'

export const useAdminUserManagementStore = defineStore('admin_loans', () => {
  const requestLoan = ref({})
  const adminUserManagementService = AdminUserManagementService.getInstance()

  const index = async (params) => {
    try {
      const { data } = await adminUserManagementService.index(params)
      requestLoan.value = data || {}
      return data
    } catch (error) {
      ElMessage.error(error.message || 'Get Loan failed')
      throw new Error(`Get Loan failed: ${error.message || 'Unknown error'}`)
    }
  }

  //staus
  const staus = async (id, payload) => {
    try {
      const { data } = await adminUserManagementService.staus(id, payload)
      requestLoan.value = data || {}
      return data
    } catch (error) {
      ElMessage.error(error.message || 'Get Loan failed')
      throw new Error(`Get Loan failed: ${error.message || 'Unknown error'}`)
    }
  }

  return {
    RequestLoan: computed(() => requestLoan.value),
    index,
    staus,
  }
})
