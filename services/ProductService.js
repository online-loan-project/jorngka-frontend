import BaseService from './BaseService'

let instance = null
class ProductService extends BaseService {
  constructor() {
    super('product')
  }

  static getInstance() {
    if (!instance) {
      instance = new ProductService()
    }
    return instance
  }

  async getProduct(payload = {}) {
    const filteredParams = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => value != null),
    )
    const queryParams = new URLSearchParams(filteredParams).toString()

    return await this._get(`${this._prefix}?${queryParams}`, {})
  }

  async showProduct(id) {
    return await this._get(`${this._prefix}/${id}`);
  }

}

export default ProductService
