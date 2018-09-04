const Kamora = require('kamora')
const authenticate = require('../../middleware/authenticate')
const conversationRepository = require('../../repositories/conversation')

const router = new Kamora.Router()

router.push({
  method: 'get',
  path: '/',
  processors: [
    authenticate,
    async (ctx, next) => {
      const request = ctx.filter

      const conversations = await conversationRepository.all({ _id: { $in: request.user.conversations } })

      ctx.body = {
        total: conversations.length,
        items: conversations
      }

      await next()
    }
  ]
})

module.exports = router
