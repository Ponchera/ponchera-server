const Kamora = require('kamora')
const error = require('../../config/error')

const User = Kamora.Database.model('user')

exports.switchOnlineStatus = async (socketId, status) => {
  await User
    .findOneAndUpdate({
      socket_id: socketId
    }, {
      is_online: status
    })
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })
}
