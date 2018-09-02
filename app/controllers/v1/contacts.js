const Kamora = require('kamora')
const authenticate = require('../../middleware/authenticate')
const validate = require('../../middleware/validate')
const contactRepository = require('../../repositories/contact')

const router = new Kamora.Router()
const Validator = Kamora.Validator

router.push({
  method: 'post',
  path: '/request',
  processors: [
    authenticate,
    validate({
      body: {
        target: Validator.string().regex(/^[a-zA-Z0-9-_.]{3,30}$/).required()
      }
    }),
    async (ctx, next) => {
      ctx.body = await contactRepository.create(ctx.filter)

      await next()
    }
  ]
})

module.exports = router
