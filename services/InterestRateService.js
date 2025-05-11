import BaseService from './BaseService'

let instance = null
class InterestRateService extends BaseService {
  constructor() {
    super('admin')
  }

  static getInstance() {
    if (!instance) {
      instance = new InterestRateService()
    }
    return instance
  }


  async index(payload = {}) {
    const filteredParams = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => value != null),
    )
    const queryParams = new URLSearchParams(filteredParams).toString()

    return await this._get(`${this._prefix}/interest-rate?${queryParams}`, {})
  }

  //store
  async store(payload = {}) {
    return await this._post(`${this._prefix}/interest-rate/create`, payload)
  }

}

export default InterestRateService
