const Kamora = require('kamora')
const error = require('../../config/error')

const User = Kamora.Database.model('user')

exports.create = async (request) => {
  const target = request.body.target

  const user = await User
    .findOne({ username: target })
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })

  // 不能添加自己
  if (request.user.username === user.username) {
    throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
  }

  // 不能重复添加
  if (user.contacts.indexOf(request.user.username) >= 0) {
    throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
  }

  let contactRequest = user.contact_requests.filter((item) => {
    return item.username === request.user.username
  })
  if (contactRequest.length) {
    // 已发送过添加联系人请求，只更新请求时间
    const index = user.contact_requests.indexOf(contactRequest[0])
    contactRequest[0] = Object.assign(contactRequest[0], {
      timestamp: (new Date()).getTime()
    })
    user.contact_requests = [
      ...user.contact_requests.slice(0, index),
      contactRequest[0],
      ...user.contact_requests.slice(index + 1)
    ]
  } else {
    // 未发送过添加联系人请求
    user.contact_requests = [...user.contact_requests, {
      username: request.user.username,
      accepted: false,
      timestamp: (new Date()).getTime()
    }]
  }
  user.save()

  return {}
}
