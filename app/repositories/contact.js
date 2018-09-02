const Kamora = require('kamora')
const error = require('../../config/error')

const User = Kamora.Database.model('user')

exports.request = async (request) => {
  const target = request.body.target

  const user = await User
    .findOne({ username: target })
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })
  if (!user) {
    throw new Kamora.Error(error.name.NOT_EXIST)
  }

  // 不能添加自己
  if (request.user.username === target) {
    throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
  }

  // 不能重复添加
  if (request.user.contacts.indexOf(target) >= 0) {
    throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
  }

  let contactRequest = user.contact_requests.filter((item) => {
    return item.username === request.user.username
  })
  if (contactRequest.length) {
    // 已发送过添加联系人请求，更新状态和请求时间
    const i = user.contact_requests.indexOf(contactRequest[0])
    contactRequest[0] = Object.assign(contactRequest[0], {
      status: 'tbc',
      timestamp: (new Date()).getTime()
    })
    user.contact_requests = [
      ...user.contact_requests.slice(0, i),
      contactRequest[0],
      ...user.contact_requests.slice(i + 1)
    ]
  } else {
    // 未发送过添加联系人请求
    user.contact_requests = [...user.contact_requests, {
      username: request.user.username,
      status: 'tbc',
      timestamp: (new Date()).getTime()
    }]
  }
  user.save()

  return {}
}

exports.response = async (request) => {
  const target = request.body.target
  const status = request.body.status

  const user = await User
    .findOne({ username: target })
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })
  if (!user) {
    throw new Kamora.Error(error.name.NOT_EXIST)
  }

  let contactRequest = request.user.contact_requests.filter((item) => {
    return item.username === target
  })
  if (!contactRequest.length || contactRequest[0].status !== 'tbc') {
    throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
  }
  const i = request.user.contact_requests.indexOf(contactRequest[0])
  contactRequest[0] = Object.assign(contactRequest[0], {
    status
  })
  request.user.contact_requests = [
    ...request.user.contact_requests.slice(0, i),
    contactRequest[0],
    ...request.user.contact_requests.slice(i + 1)
  ]
  if (status === 'accepted') {
    if (request.user.contacts.indexOf(target) < 0) {
      request.user.contacts = [...request.user.contacts, target]
    }
    user.contacts = [...user.contacts, request.user.username]
    user.save()
  }
  request.user.save()

  return {}
}

exports.destroy = async (request) => {
  const target = request.body.target

  const user = await User
    .findOne({ username: target })
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })
  if (!user) {
    throw new Kamora.Error(error.name.NOT_EXIST)
  }

  // 不能删除自己
  if (request.user.username === target) {
    throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
  }

  // 不能重复删除
  const i = request.user.contacts.indexOf(target)
  if (i < 0) {
    throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
  }

  request.user.contacts = [
    ...request.user.contacts.slice(0, i),
    ...request.user.contacts.slice(i + 1)
  ]
  request.user.save()

  return {}
}

exports.index = async (request) => {
  const contacts = request.user.contacts

  return {
    total: contacts.length,
    items: contacts
  }
}
