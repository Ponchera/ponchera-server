const Kamora = require('kamora')
const authenticate = require('../../middleware/authenticate')
const validate = require('../../middleware/validate')
const conversationRepository = require('../../repositories/conversation')

const router = new Kamora.Router()
const Validator = Kamora.Validator

router.push({
  method: 'post',
  path: '/',
  processors: [
    authenticate,
    validate({
      body: {
        members: Validator.array().required()
      }
    }),
    async (ctx, next) => {
      ctx.body = await conversationRepository.create(ctx.filter)

      await next()
    }
  ]
})

module.exports = router
