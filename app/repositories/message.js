const Kamora = require('kamora')
const error = require('../../config/error')

const Conversation = Kamora.Database.model('conversation')
const User = Kamora.Database.model('user')
const redis = Kamora.redis

exports.sendMessage = async (io, payloads) => {
  let conversation
  const from = payloads[0].from
  const target = payloads[0].target
  const targetType = payloads[0].target_type

  // 判断是单聊还是群聊
  if (targetType === 'user') {
    // 查找消息发送者是否有同消息接收者的聊天
    const fromUser = await User
      .findOne({ 'username': from })
      .populate('conversations')
      .catch(() => {
        throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
      })
    const conversations = fromUser.conversations.filter((conversation) => {
      return conversation.creator === target || conversation.cid === target
    })

    if (conversations.length) {
      // 找到聊天，直接使用
      conversation = conversations[0]
    } else {
      // 创建一个新聊天
      const newConversation = new Conversation({
        cid: target,
        creator: from,
        members: [from, target]
      })
      conversation = await newConversation
        .save()
        .catch(() => {
          throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
        })

      // 更新消息发送者和消息接收者的聊天列表
      fromUser.conversations = [...fromUser.conversations, conversation._id]
      fromUser.save()
      await User
        .update({ username: target }, { $addToSet: { conversations: conversation._id } })
        .catch(() => {
          throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
        })
    }
  } else {
    conversation = await Conversation
      .findOne({ cid: target })
      .catch(() => {
        throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
      })
  }

  const members = await User
    .find({ 'username': { $in: conversation.members } })
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })

  payloads = payloads.map((payload) => {
    payload.timestamp = Date.now()
    return payload
  })

  members.forEach((member) => {
    if (member.is_online && member.socket_id) {
      io
        .to(member.socket_id)
        .emit('message', payloads)
    } else {
      const serialPayloads = payloads.map((payload) => {
        return JSON.stringify(payload)
      })
      redis.rpush(`message:${member.id}`, ...serialPayloads)
    }
  })
}

exports.sendOfflineMessage = async (io, userId) => {
  let redisKey = `message:${userId}`
  let queue = await redis.lrange(redisKey, 0, -1)
  if (!queue.length) {
    return
  }

  let payloads = queue.map((item) => {
    return JSON.parse(item)
  })

  let payloadsDict = new Map()
  for (let i = 0; i < payloads.length; i++) {
    let payload = payloads[i]
    let conversationId = payload.conversation_id

    if (payloadsDict.get(conversationId)) {
      payloadsDict.get(conversationId).push(payload)
    } else {
      payloadsDict.set(conversationId, [payload])
    }
  }

  for (let value of payloadsDict.values()) {
    io
      .emit('message', value)
  }

  await redis.del(redisKey)
}
