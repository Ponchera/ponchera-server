const Kamora = require('kamora')
const validate = require('../../middleware/validate')
const applicationRepository = require('../../repositories/application')

const router = new Kamora.Router()
const Validator = Kamora.Validator

router.push({
  method: 'post',
  path: '/',
  processors: [
    validate({
      body: {
        name: Validator.string().max(20).required()
      }
    }),
    async (ctx, next) => {
      ctx.body = await applicationRepository.create(ctx.filter.body)

      await next()
    }
  ]
})

module.exports = router
