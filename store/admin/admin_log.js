import { defineStore } from 'pinia'
import AdminLogService from '~/services/Admin/AdminLogService.js'

export const useAdminLogStore = defineStore('admin_logs', () => {
  const adminLogService = AdminLogService.getInstance()

  const index = async (params) => {
    try {
      const { data } = await adminLogService.index(params)
      return data
    } catch (error) {
      ElMessage.error(error.message || 'Get Log failed')
      throw new Error(`Get Log failed: ${error.message || 'Unknown error'}`)
    }
  }

  return {
    index,
  }
})
