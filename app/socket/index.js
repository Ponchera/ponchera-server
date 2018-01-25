const Kamora = require('kamora')
const io = require('socket.io')(Kamora.server)
const socketioJwt = require('socketio-jwt')
const jwtConfig = require('../../config/jwt')
const authRepository = require('../repositories/auth')

io.sockets
  .on('connection', socketioJwt.authorize({
    secret: jwtConfig.secret,
    callback: false,
    timeout: 15000
  }))
  .on('authenticated', function (socket) {
    console.log('hello! ' + socket.decoded_token.uid + '/' + socket.id)
    authRepository.bindSocketIdToUser(socket.decoded_token.uid, socket.id)
      .catch(() => {
      })

    socket.on('message', function (payloads) {
      console.log(payloads)
      io
        .to(socket.id)
        .emit('message', payloads)
    })

    socket.on('disconnect', function () {
      console.log('off: ' + socket.id)
    })
  })
