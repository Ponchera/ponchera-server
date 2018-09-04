const Kamora = require('kamora')
const bcrypt = require('bcryptjs')
const error = require('../../config/error')

const User = Kamora.Database.model('user')

exports.create = async (data) => {
  const salt = await bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync(data.password, salt)
  const user = new User({
    username: data.username,
    password: hash,
    application: data.application,
    organization: data.organization
  })
  const createdUser = await user
    .save()
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })

  return createdUser
}

exports.findBy = async (condition) => {
  const user = await User
    .findOne(condition)
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })

  return user
}

exports.switchOnlineStatus = async (socketId, status) => {
  await User
    .findOneAndUpdate({
      socket_id: socketId
    }, {
      is_online: status
    })
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })
}

exports.bindSocketIdToUser = async (socketId, userId) => {
  await User
    .findByIdAndUpdate(userId, {
      socket_id: socketId,
      is_online: true
    })
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })
}
