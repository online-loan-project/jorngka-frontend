import BaseService from '../BaseService.js'

let instance = null
class AdminDashboardService extends BaseService {
  constructor() {
    super('admin')
  }

  static getInstance() {
    if (!instance) {
      instance = new AdminDashboardService()
    }
    return instance
  }

  async index(payload = {}) {
    const filteredParams = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => value != null),
    )
    const queryParams = new URLSearchParams(filteredParams).toString()

    return await this._get(`${this._prefix}/dashboard?${queryParams}`, {})
  }
}

export default AdminDashboardService
