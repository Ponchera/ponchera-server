const Kamora = require('kamora')
const error = require('../../../config/error')
const authenticate = require('../../middleware/authenticate')
const validate = require('../../middleware/validate')
const conversationRepository = require('../../repositories/conversation')

const router = new Kamora.Router()
const Validator = Kamora.Validator
const Id = Kamora.Database.model('id')

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
      const request = ctx.filter
      const creator = request.user.username
      const members = request.body.members

      const id = await Id
        .findOneAndUpdate({ table: 'conversations' }, { $inc: { index: 1 } })
        .catch(() => {
          throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
        })

      const createdConversation = await conversationRepository.create({
        cid: id.index,
        type: 'group',
        creator,
        members,
        application: request.user.application.id,
        is_new: true
      })

      // 更新聊天创建者的聊天列表
      request.user.conversations = [...request.user.conversations, createdConversation.id]
      request.user.save()

      ctx.body = createdConversation

      await next()
    }
  ]
})

module.exports = router
