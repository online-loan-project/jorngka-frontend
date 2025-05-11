import BaseService from './BaseService'

let instance = null
class LoanService extends BaseService {
  constructor() {
    super('borrower')
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
}

export default LoanService
