import BaseService from '../BaseService.js'

let instance = null
class AdminCreditService extends BaseService {
  constructor() {
    super('admin')
  }

  static getInstance() {
    if (!instance) {
      instance = new AdminCreditService()
    }
    return instance
  }


  async index(payload = {}) {
    const filteredParams = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => value != null),
    )
    const queryParams = new URLSearchParams(filteredParams).toString()

    return await this._get(`${this._prefix}/credit?${queryParams}`, {})
  }

  //deposit
  async deposit(req) {
    return await this._post(`${this._prefix}/credit/deposit`, req)
  }

  //withdraw
  async withdraw(req) {
    return await this._post(`${this._prefix}/credit/withdraw`, req)
  }

}

export default AdminCreditService
