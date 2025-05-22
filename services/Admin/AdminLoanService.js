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

    return await this._get(`${this._prefix}/loan?${queryParams}`, {})
  }

  //paid
  async paid(repaymentId, req) {
    return await this._post(`${this._prefix}/loan/repayment/paid/${repaymentId}`, req)
  }


}

export default LoanService
