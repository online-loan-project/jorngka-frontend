import BaseService from './BaseService'

let instance = null
class CreditScoreService extends BaseService {
  constructor() {
    super('admin')
  }

  static getInstance() {
    if (!instance) {
      instance = new CreditScoreService()
    }
    return instance
  }


  async index(payload = {}) {
    const filteredParams = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => value != null),
    )
    const queryParams = new URLSearchParams(filteredParams).toString()

    return await this._get(`${this._prefix}/credit-score?${queryParams}`, {})
  }

  //store
  async reset(params ,req) {
    return await this._post(`${this._prefix}/credit-score/reset/${params}`, req)
  }

  //update
  async update(user_id,req) {
    return await this._post(`${this._prefix}/credit-score/update/${user_id}`, req)
  }

}

export default CreditScoreService
