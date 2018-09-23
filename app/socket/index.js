const Kamora = require('kamora')
const io = require('socket.io')(Kamora.server)
const socketioJwt = require('socketio-jwt')
const jwtConfig = require('../../config/jwt')
const userRepository = require('../repositories/user')
const messageRepository = require('../repositories/message')

io.sockets
  .on('connection', socketioJwt.authorize({
    secret: jwtConfig.secret,
    callback: false,
    timeout: 15000
  }))
  .on('authenticated', function (socket) {
    userRepository.bindSocketIdToUser(socket.id, socket.decoded_token.uid)
      .then(() => {
        messageRepository.sendOfflineMessage(socket, socket.decoded_token.uid)
      })
      .catch(() => {
      })

    socket.on('message', function (payloads) {
      messageRepository.sendMessage(io, payloads)
        .catch(() => {
        })
    })

    socket.on('disconnect', function () {
      userRepository.switchOnlineStatus(socket.id, false)
        .catch(() => {
        })
    })
  })
