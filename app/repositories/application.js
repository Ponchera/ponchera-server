const Kamora = require('kamora')
const error = require('../../config/error')
const utilService = require('../services/util')

const Application = Kamora.Database.model('application')

exports.create = async (data) => {
  const application = new Application({
    name: data.name,
    key: data.key,
    secret: utilService.getRandomChar(false, 32),
    organization: data.organization
  })
  const createdApplication = await application
    .save()
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })

  return createdApplication
}

exports.findBy = async (condition) => {
  const application = await Application
    .findOne(condition)
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })

  return application
}
