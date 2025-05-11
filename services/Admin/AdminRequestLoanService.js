import BaseService from '../BaseService.js'

let instance = null
class LoanService extends BaseService {
  constructor() {
    super('admin')
  }

  static getInstance() {
    if (!instance) {
      instance = new LoanService()
    }
    return instance
  }


  async index(payload = {}) {
    const filteredParams = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => value != null),
    )
    const queryParams = new URLSearchParams(filteredParams).toString()

    return await this._get(`${this._prefix}/request-loan?${queryParams}`, {})
  }

  //approve
  async approve(id) {
    return await this._post(`${this._prefix}/request-loan/approve/${id}`, {})
  }

  //reject
  async reject(id, payload) {
    return await this._post(`${this._prefix}/request-loan/reject/${id}`, payload)
  }
}

export default LoanService
