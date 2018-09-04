const Kamora = require('kamora')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const error = require('../../../config/error')
const jwtConfig = require('../../../config/jwt')
const applicationAuthenticate = require('../../middleware/application_authenticate')
const validate = require('../../middleware/validate')
const userRepository = require('../../repositories/user')
const applicationRepository = require('../../repositories/application')

const router = new Kamora.Router()
const Validator = Kamora.Validator
const Application = Kamora.Database.model('application')

router.push({
  method: 'post',
  path: '/register',
  processors: [
    applicationAuthenticate,
    validate({
      body: {
        username: Validator.string().regex(/^[a-zA-Z0-9-_.]{3,30}$/).required(),
        password: Validator.string().regex(/(?!.*[\u4E00-\u9FA5\s])(?!^[a-zA-Z]+$)(?!^[\d]+$)(?!^[^a-zA-Z\d]+$)^.{8,16}$/).required()
      }
    }),
    async (ctx, next) => {
      const request = ctx.filter
      const username = request.body.username
      const password = request.body.password

      const user = await userRepository.findBy({ username, application: request.application.id })
      if (user) {
        throw new Kamora.Error(error.name.ALREADY_EXISTS)
      }

      const createdUser = await userRepository.create({
        username,
        password,
        application: request.application.id,
        organization: request.application.organization
      })
      ctx.body = createdUser

      await next()
    }
  ]
})

router.push({
  method: 'post',
  path: '/login',
  processors: [
    validate({
      body: {
        username: Validator.string().regex(/^[a-zA-Z0-9-_.]{3,30}$/).required(),
        password: Validator.string().regex(/(?!.*[\u4E00-\u9FA5\s])(?!^[a-zA-Z]+$)(?!^[\d]+$)(?!^[^a-zA-Z\d]+$)^.{8,16}$/).required(),
        key: Validator.string()
      }
    }),
    async (ctx, next) => {
      const request = ctx.filter
      const username = request.body.username
      const password = request.body.password
      const key = request.body.key

      let user
      if (key) {
        const application = await applicationRepository.findBy({
          key
        })
        if (!application) {
          throw new Kamora.Error(error.name.NOT_EXIST)
        }

        user = await userRepository.findBy({ username, application: application.id })
      } else {
        user = await userRepository.findBy({
          username,
          application: { $exists: false }
        })
      }
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
      ctx.set('Authorization', token)
      ctx.body = user

      await next()
    }
  ]
})

router.push({
  method: 'get',
  path: '/token',
  processors: [
    validate({
      query: {
        grant_type: Validator.string().required(),
        key: Validator.string().required(),
        secret: Validator.string().required()
      }
    }),
    async (ctx, next) => {
      const request = ctx.filter

      const application = await Application
        .findOne({ key: request.query.key, secret: request.query.secret })
        .catch(() => {
          throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
        })
      if (!application) {
        throw new Kamora.Error(error.name.NOT_EXIST)
      }

      const token = jwt.sign({
        uid: application.id,
        exp: Math.floor(Date.now() / 1000) + jwtConfig.ttl * 60
      }, jwtConfig.secret)

      ctx.body = {
        access_token: token,
        expires_in: jwtConfig.ttl * 60
      }

      await next()
    }
  ]
})

module.exports = router
