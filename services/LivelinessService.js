import BaseService from './BaseService'

let instance = null
class LivelinessService extends BaseService {
  constructor() {
    super('')
  }

  static getInstance() {
    if (!instance) {
      instance = new LivelinessService()
    }
    return instance
  }


  async liveliness(req) {
    return await this._post(`${this._prefix}/liveliness`, req)
  }

  async storeNid(req) {
    return await this._post(`${this._prefix}/nid-verify`, req)
  }
}

export default LivelinessService
