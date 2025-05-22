export const useTransformer = async (transformer) => {
  try {
    const callbackFunction = (module, callback) => {
      if (callback && typeof callback === 'function') {
        return callback(module.default.getInstance())
      }
      return module.default.getInstance()
    }

    const transformerModule = (callback) => {
      return import(`~/transformers/${transformer}Transformer.js`).then(
        (module) => {
          return callbackFunction(module, callback)
        },
      )
    }
    if (!transformerModule) {
      return {}
    }
    return transformerModule
  } catch (error) {
    return {}
  }
}
