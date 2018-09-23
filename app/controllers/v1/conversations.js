const Kamora = require('kamora')
const error = require('../../../config/error')
const authenticate = require('../../middleware/authenticate')
const validate = require('../../middleware/validate')
const conversationRepository = require('../../repositories/conversation')

const router = new Kamora.Router()
const Validator = Kamora.Validator
const User = Kamora.Database.model('user')
const Id = Kamora.Database.model('id')

router.push({
  method: 'post',
  path: '/',
  processors: [
    authenticate,
    validate({
      body: {
        type: Validator.string().required(),
        members: Validator.array().required()
      }
    }),
    async (ctx, next) => {
      const request = ctx.filter
      const type = request.body.type
      const creator = request.user.username
      const members = request.body.members

      switch (type) {
        case 'user':
          // 查找消息发送者和消息接收者是否有共同的聊天
          const target = members.find(member => member !== creator)
          const conversation = request.user.conversations.find((conversation) => {
            return conversation.type === 'user' && (conversation.creator === target || conversation.members.indexOf(target) > 0)
          })
          if (conversation) {
            // 找到聊天，直接使用
            ctx.body = conversation
          } else {
            // 创建一个新聊天
            const id = await Id
              .findOneAndUpdate({ table: 'conversations' }, { $inc: { index: 1 } })
              .catch(() => {
                throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
              })

            const createdConversation = await conversationRepository.create({
              cid: id.index,
              type,
              creator,
              members,
              application: request.user.application.id,
              is_new: false
            })

            // 更新消息发送者和消息接收者的聊天列表
            request.user.conversations = [...request.user.conversations, createdConversation.id]
            request.user.save()
            await User
              .update({ username: target }, { $addToSet: { conversations: createdConversation.id } })
              .catch(() => {
                throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
              })

            ctx.body = createdConversation
          }
          break
        case 'group':
          const id = await Id
            .findOneAndUpdate({ table: 'conversations' }, { $inc: { index: 1 } })
            .catch(() => {
              throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
            })

          const createdConversation = await conversationRepository.create({
            cid: id.index,
            type,
            creator,
            members,
            application: request.user.application.id,
            is_new: true
          })

          // 更新聊天创建者的聊天列表
          request.user.conversations = [...request.user.conversations, createdConversation.id]
          request.user.save()

          ctx.body = createdConversation
          break
      }

      await next()
    }
  ]
})

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
