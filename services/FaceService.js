import BaseService from './BaseService'

let instance = null
class FaceService extends BaseService {
  constructor() {
    super('borrower')
  }

  static getInstance() {
    if (!instance) {
      instance = new FaceService()
    }
    return instance
  }


  async verify(req) {
    return await this._post(`${this._prefix}/face`, req)
  }

  async getLatestNidImage(req) {
    return await this._get(`${this._prefix}/nid-image`, req)
  }

  //getLatestLivelinessImage
  async getLatestLivelinessImage(req) {
    return await this._get(`${this._prefix}/liveliness-image`, req)
  }
}

export default FaceService
