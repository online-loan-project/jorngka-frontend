import BaseService from './BaseService'

let instance = null
class AuthService extends BaseService {
  constructor () {
    super('')
  }

  static getInstance () {
    if (!instance) {
      instance = new AuthService()
    }
    return instance
  }

  async login (req) {
    return await this._post(`${this._prefix}/login`, req)
  }

  async register (req) {
    return await this._post(`${this._prefix}/register`, req)
  }

  async getMe () {
    return await this._get(`${this._prefix}/me`)
  }

  async logout (req) {
    return await this._post(`${this._prefix}/logout`, req)
  }

  //telegram-chat
  async telegramChat (req) {
    return await this._post(`${this._prefix}/telegram-chat-id`, req)
  }

  async sendCode () {
    return await this._get(`${this._prefix}/send/code`)
  }

  //verify/code
  async verifyCode (req) {
    return await this._post(`${this._prefix}/verify/code`, req)
  }

  //change-password
  async changePassword (req) {
    return await this._post(`${this._prefix}/change-password`, req)
  }
}

export default AuthService
