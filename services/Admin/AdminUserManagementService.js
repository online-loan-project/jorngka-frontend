import BaseService from '../BaseService.js'

let instance = null
class AdminUserManagementService extends BaseService {
  constructor() {
    super('admin')
  }

  static getInstance() {
    if (!instance) {
      instance = new AdminUserManagementService()
    }
    return instance
  }


  async index(payload = {}) {
    const filteredParams = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => value != null),
    )
    const queryParams = new URLSearchParams(filteredParams).toString()

    return await this._get(`${this._prefix}/borrowers?${queryParams}`, {})
  }

  async staus(id, payload = {}) {
    return await this._post(`${this._prefix}/borrowers/status/${id}`, payload);
  }

}

export default AdminUserManagementService
