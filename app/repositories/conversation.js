const Kamora = require('kamora')
const error = require('../../config/error')

const Conversation = Kamora.Database.model('conversation')
const Id = Kamora.Database.model('id')

exports.create = async (request) => {
  const creator = request.user.username
  const members = request.body.members

  const id = await Id
    .findOneAndUpdate({ table: 'conversations' }, { $inc: { index: 1 } })
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })

  const newConversation = new Conversation({
    cid: id.index,
    type: 'conversation',
    creator,
    members,
    is_new: true
  })
  const conversation = await newConversation
    .save()
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })

  // 更新聊天创建者的聊天列表
  request.user.conversations = [...request.user.conversations, conversation._id]
  request.user.save()

  return conversation
}
