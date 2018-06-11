const Kamora = require('kamora')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const error = require('../../config/error')
const jwtConfig = require('../../config/jwt')

const User = Kamora.Database.model('user')

exports.register = async (request) => {
  const username = request.body.username
  const password = request.body.password

  const userExists = await User
    .findOne({ username })
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })
  if (userExists) {
    throw new Kamora.Error(error.name.ALREADY_EXISTS)
  }

  const salt = await bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync(password, salt)
  const user = new User({
    username,
    password: hash
  })
  const userCreated = await user
    .save()
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })

  return userCreated
}

exports.login = async (request) => {
  const username = request.body.username
  const password = request.body.password

  const user = await User
    .findOne({ username })
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })
  if (!user) {
    throw new Kamora.Error(error.name.NOT_EXIST)
  }

  if (!bcrypt.compareSync(password, user.password)) {
    throw new Kamora.Error(error.name.REQUEST_FAILED, '用户名或密码错误')
  }

  const token = jwt.sign({
    uid: user.id,
    exp: Math.floor(Date.now() / 1000) + jwtConfig.ttl * 60
  }, jwtConfig.secret)

  return {
    user,
    token
  }
}

exports.bindSocketIdToUser = async (userId, socketId) => {
  await User
    .findByIdAndUpdate(userId, {
      socket_id: socketId,
      is_online: true
    })
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })
}
