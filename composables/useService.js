export const useService = async (service) => {
  try {
    const callbackFunction = (module, callback) => {
      if (callback && typeof callback === 'function') {
        return callback(module.default.getInstance())
      }
      return module.default.getInstance()
    }

    const serviceModule = (callback) => {
      return import(`~/services/${service}Service.js`).then((module) => {
        return callbackFunction(module, callback)
      })
    }
    return serviceModule
  } catch (error) {
    return {}
  }
}
