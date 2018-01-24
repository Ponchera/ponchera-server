const Kamora = require('kamora')
const validate = require('../../middleware/validate')
const authRepository = require('../../repositories/auth')

const router = new Kamora.Router()
const Validator = Kamora.Validator

router.push({
  method: 'post',
  path: '/register',
  processors: [
    validate({
      body: {
        username: Validator.string().regex(/^[a-zA-Z0-9-_.]{3,30}$/).required(),
        password: Validator.string().regex(/(?!.*[\u4E00-\u9FA5\s])(?!^[a-zA-Z]+$)(?!^[\d]+$)(?!^[^a-zA-Z\d]+$)^.{8,16}$/).required()
      }
    }),
    async (ctx, next) => {
      ctx.body = await authRepository.register(ctx.filter)

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
        password: Validator.string().regex(/(?!.*[\u4E00-\u9FA5\s])(?!^[a-zA-Z]+$)(?!^[\d]+$)(?!^[^a-zA-Z\d]+$)^.{8,16}$/).required()
      }
    }),
    async (ctx, next) => {
      const response = await authRepository.login(ctx.filter)
      ctx.set('Authorization', response.token)
      ctx.body = response.user

      await next()
    }
  ]
})

module.exports = router
