const Kamora = require('kamora')
const validate = require('../../middleware/validate')
const organizationRepository = require('../../repositories/organization')

const router = new Kamora.Router()
const Validator = Kamora.Validator

router.push({
  method: 'post',
  path: '/',
  processors: [
    validate({
      body: {
        username: Validator.string().max(20).required()
      }
    }),
    async (ctx, next) => {
      ctx.body = await organizationRepository.create(ctx.filter)

      await next()
    }
  ]
})

module.exports = router
