const Kamora = require('kamora')
const error = require('../../../config/error')
const validate = require('../../middleware/validate')
const organizationRepository = require('../../repositories/organization')
const userRepository = require('../../repositories/user')

const router = new Kamora.Router()
const Validator = Kamora.Validator

router.push({
  method: 'post',
  path: '/',
  processors: [
    validate({
      body: {
        username: Validator.string().regex(/^[a-zA-Z0-9-_.]{3,30}$/).required(),
        password: Validator.string().regex(/(?!.*[\u4E00-\u9FA5\s])(?!^[a-zA-Z]+$)(?!^[\d]+$)(?!^[^a-zA-Z\d]+$)^.{8,16}$/).required(),
        name: Validator.string().max(20).required(),
        display_name: Validator.string().max(50)
      }
    }),
    async (ctx, next) => {
      const request = ctx.filter
      const name = request.body.name
      const displayName = request.body.display_name
      const username = request.body.username
      const password = request.body.password

      const organization = await organizationRepository.findBy({ name })
      if (organization) {
        throw new Kamora.Error(error.name.ALREADY_EXISTS)
      }
      const user = await userRepository.findBy({ username, application: { $exists: false } })
      if (user) {
        throw new Kamora.Error(error.name.ALREADY_EXISTS)
      }

      const createdOrganization = await organizationRepository.create({
        name,
        display_name: displayName
      })
      await userRepository.create({
        username,
        password,
        organization: createdOrganization.id
      })
      ctx.body = createdOrganization

      await next()
    }
  ]
})

module.exports = router
