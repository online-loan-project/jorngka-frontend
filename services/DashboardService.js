import BaseService from './BaseService'

let instance = null
class DashboardService extends BaseService {
  constructor() {
    super('borrower')
  }

  static getInstance() {
    if (!instance) {
      instance = new DashboardService()
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

export default DashboardService
