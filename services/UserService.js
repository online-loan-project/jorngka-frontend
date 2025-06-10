import BaseService from './BaseService'

let instance = null
class UserService extends BaseService {
  constructor() {
    super('user')
  }

  static getInstance() {
    if (!instance) {
      instance = new UserService()
    }
    return instance
  }

  async getMe() {
    return await this._get(`${this._prefix}/me`)
  }

  async updateProfile(id ,req) {
    return await this._post(`${this._prefix}/${id}`, req)
  }

  async updatePassword(req) {
    return await this._post(`${this._prefix}/update-password`, req)
  }

  //get user
  async getUsers(params) {
    const queryParams = new URLSearchParams(params).toString()
    return await this._get(`${this._prefix}?${queryParams}`)
  }

  //get user by id
  async getUserById(id) {
    return await this._get(`${this._prefix}/${id}`)
  }
}

export default UserService
