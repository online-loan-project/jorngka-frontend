import BaseService from './BaseService'

let instance = null
class ProfileService extends BaseService {
  constructor () {
    super('profile')
  }

  static getInstance () {
    if (!instance) {
      instance = new ProfileService()
    }
    return instance
  }

  async getProfile (req) {
    return await this._get(`${this._prefix}`, req)
  }

  async updateProfile (req) {
    return await this._post(`${this._prefix}/update`, req)
  }
}

export default ProfileService
