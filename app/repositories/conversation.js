const Kamora = require('kamora')
const error = require('../../config/error')

const Conversation = Kamora.Database.model('conversation')

exports.create = async (data) => {
  const conversation = new Conversation(data)
  const createdConversation = await conversation
    .save()
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })

  return createdConversation
}

exports.all = async (condition) => {
  const conversations = await Conversation
    .find(condition)
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })

  return conversations
}

exports.findBy = async (condition) => {
  const conversation = await Conversation
    .findOne(condition)
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })

  return conversation
}
