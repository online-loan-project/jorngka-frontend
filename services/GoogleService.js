import BaseService from './BaseService';

let instance = null;

class GoogleService extends BaseService {
  constructor() {
    super('');
  }

  static getInstance() {
    if (!instance) {
      instance = new GoogleService();
    }
    return instance;
  }

  async callBack(req) {
    return await this._post(`${this._prefix}/callback/google`, req);
  }
}

export default GoogleService;