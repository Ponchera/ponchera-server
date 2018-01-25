const Kamora = require('kamora')
const error = require('../../config/error')

const Conversation = Kamora.Database.model('conversation')
const User = Kamora.Database.model('user')

exports.sendMessage = async (io, payload) => {
  const conversationId = payload.conversation_id

  const conversation = await Conversation
    .findById(conversationId)
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })

  const members = await User
    .find({ 'username': { $in: conversation.members } })
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })

  payload.timestamp = Date.now()

  members.forEach((member) => {
    if (member.socket_id) {
      io
        .to(member.socket_id)
        .emit('message', payload)
    }
  })
}
