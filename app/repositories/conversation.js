const Kamora = require('kamora')
const error = require('../../config/error')

const Conversation = Kamora.Database.model('conversation')

exports.create = async (request) => {
  const creator = request.user.username
  const members = request.body.members

  const conversation = new Conversation({
    creator,
    members
  })
  const conversationCreated = await conversation
    .save()
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })

  return conversationCreated
}
