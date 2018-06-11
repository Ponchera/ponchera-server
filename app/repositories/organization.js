const Kamora = require('kamora')
const error = require('../../config/error')

const Organization = Kamora.Database.model('organization')

exports.create = async (request) => {
  const username = request.body.username

  const organizationExists = await Organization
    .findOne({ username })
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })
  if (organizationExists) {
    throw new Kamora.Error(error.name.ALREADY_EXISTS)
  }

  const organization = new Organization({
    username
  })
  const organizationCreated = await organization
    .save()
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })

  return organizationCreated
}
