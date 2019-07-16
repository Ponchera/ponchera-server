const Kamora = require('kamora')
const jwt = require('jsonwebtoken')
const error = require('../../config/error')
const jwtConfig = require('../../config/jwt')

const Application = Kamora.Database.model('application')

const getApplicationFromToken = async (token) => {
  const application = await Application
    .findById(token.uid)
    .catch(() => {
      throw new Kamora.Error(error.name.INTERNAL_SERVER_ERROR)
    })
  return application
}

module.exports = async (ctx, next) => {
  const token = ctx.get('Authorization')
  if (!token) {
    throw new Kamora.Error(error.name.LOGIN_REQUIRED, '令牌认证失败')
  }

  try {
    const decoded = await jwt.verify(token, jwtConfig.secret)

    ctx.filter = ctx.filter || {}
    ctx.filter.application = await getApplicationFromToken(decoded)
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      // ignoreExpiration为true时即使过期也能解析成功
      const decoded = await jwt.verify(token, jwtConfig.secret, { ignoreExpiration: true })

      // 只要令牌在刷新期限内，就给发放新的令牌，不论旧令牌是否已经生成过新令牌，也不作废旧令牌
      if (Math.floor(Date.now() / 1000) - decoded.exp <= jwtConfig.refresh_ttl * 60) {
        ctx.filter = ctx.filter || {}
        ctx.filter.application = await getApplicationFromToken(decoded)

        const newToken = jwt.sign({
          uid: decoded.uid,
          exp: Math.floor(Date.now() / 1000) + jwtConfig.ttl * 60
        }, jwtConfig.secret)
        ctx.set('Authorization', newToken)
      } else {
        throw new Kamora.Error(error.name.LOGIN_REQUIRED, '令牌已过期，请重新登录')
      }
    } else {
      throw new Kamora.Error(error.name.LOGIN_REQUIRED, '令牌不合法，请重新登录')
    }
  }

  await next()
}
