const Kamora = require('kamora')
const error = require('../../../config/error')
const authenticate = require('../../middleware/authenticate')
const validate = require('../../middleware/validate')
const applicationRepository = require('../../repositories/application')

const router = new Kamora.Router()
const Validator = Kamora.Validator

router.push({
  method: 'post',
  path: '/',
  processors: [
    authenticate,
    validate({
      body: {
        name: Validator.string().max(20).required(),
        display_name: Validator.string().max(50)
      }
    }),
    async (ctx, next) => {
      const request = ctx.filter
      const name = request.body.name
      const organization = request.user.organization

      const application = await applicationRepository.findBy({
        name,
        organization: organization.id
      })
      if (application) {
        throw new Kamora.Error(error.name.ALREADY_EXISTS)
      }

      ctx.body = await applicationRepository.create({
        name,
        key: `${organization.name}@${name}`,
        organization: organization.id
      })

      await next()
    }
  ]
})

module.exports = router
