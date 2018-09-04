const Kamora = require('kamora')
const error = require('../../../config/error')
const authenticate = require('../../middleware/authenticate')
const validate = require('../../middleware/validate')
const userRepository = require('../../repositories/user')

const router = new Kamora.Router()
const Validator = Kamora.Validator

router.push({
  method: 'post',
  path: '/:username/request',
  processors: [
    authenticate,
    validate({
      params: {
        username: Validator.string().regex(/^[a-zA-Z0-9-_.]{3,30}$/).required()
      }
    }),
    async (ctx, next) => {
      const request = ctx.filter
      const username = request.params.username

      const user = await userRepository.findBy({ username, application: request.user.application.id })
      if (!user) {
        throw new Kamora.Error(error.name.NOT_EXIST)
      }

      // 不能添加自己
      if (request.user.username === username) {
        throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
      }

      // 不能重复添加
      if (request.user.contacts.indexOf(username) >= 0) {
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

      ctx.body = {}

      await next()
    }
  ]
})

router.push({
  method: 'post',
  path: '/:username/response',
  processors: [
    authenticate,
    validate({
      params: {
        username: Validator.string().regex(/^[a-zA-Z0-9-_.]{3,30}$/).required()
      },
      body: {
        status: Validator.string().required()
      }
    }),
    async (ctx, next) => {
      const request = ctx.filter
      const username = request.params.username
      const status = request.body.status

      const user = await userRepository.findBy({ username, application: request.user.application.id })
      if (!user) {
        throw new Kamora.Error(error.name.NOT_EXIST)
      }

      let contactRequest = request.user.contact_requests.filter((item) => {
        return item.username === username
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
        if (request.user.contacts.indexOf(username) < 0) {
          request.user.contacts = [...request.user.contacts, username]
        }
        user.contacts = [...user.contacts, request.user.username]
        user.save()
      }
      request.user.save()

      ctx.body = {}

      await next()
    }
  ]
})

router.push({
  method: 'delete',
  path: '/:username',
  processors: [
    authenticate,
    validate({
      params: {
        username: Validator.string().regex(/^[a-zA-Z0-9-_.]{3,30}$/).required()
      }
    }),
    async (ctx, next) => {
      const request = ctx.filter
      const username = request.params.username

      const user = await userRepository.findBy({ username, application: request.user.application.id })
      if (!user) {
        throw new Kamora.Error(error.name.NOT_EXIST)
      }

      // 不能删除自己
      if (request.user.username === username) {
        throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
      }

      // 不能重复删除
      const i = request.user.contacts.indexOf(username)
      if (i < 0) {
        throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
      }

      request.user.contacts = [
        ...request.user.contacts.slice(0, i),
        ...request.user.contacts.slice(i + 1)
      ]
      request.user.save()

      ctx.body = {}

      await next()
    }
  ]
})

router.push({
  method: 'get',
  path: '/',
  processors: [
    authenticate,
    async (ctx, next) => {
      const request = ctx.filter
      const contacts = request.user.contacts

      ctx.body = {
        total: contacts.length,
        items: contacts
      }

      await next()
    }
  ]
})

module.exports = router
