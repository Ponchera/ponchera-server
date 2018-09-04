const Kamora = require('kamora')
const error = require('../../config/error')

const Organization = Kamora.Database.model('organization')

exports.create = async (data) => {
  const organization = new Organization(data)
  const createdOrganization = await organization
    .save()
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })

  return createdOrganization
}

exports.findBy = async (condition) => {
  const organization = await Organization
    .findOne(condition)
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })

  return organization
}
