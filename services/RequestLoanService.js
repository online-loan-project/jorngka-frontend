import BaseService from './BaseService'

let instance = null
class UserService extends BaseService {
  constructor() {
    super('borrower')
  }

  static getInstance() {
    if (!instance) {
      instance = new UserService()
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

  //store nid
  async storeNid(req) {
    return await this._post(`${this._prefix}/nid-verify`, req)
  }

  //store
  async store(req) {
    return await this._post(`${this._prefix}/request-loan`, req)
  }

}

export default UserService
