const Kamora = require('kamora')
const error = require('../../config/error')
const utilService = require('../services/util')

const Application = Kamora.Database.model('application')

exports.create = async (request) => {
  const name = request.body.name

  const applicationExists = await Application
    .findOne({ name })
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })
  if (applicationExists) {
    throw new Kamora.Error(error.name.ALREADY_EXISTS, '', 400)
  }

  const application = new Application({
    name,
    secret: utilService.getRandomChar(false, 32)
  })
  const applicationCreated = await application
    .save()
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })

  return applicationCreated
}
