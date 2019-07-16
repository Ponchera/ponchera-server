require('dotenv').config()

module.exports = {
  secret: process.env.JWT_SECRET,
  ttl: 1440, // 1天
  refresh_ttl: 20160 // 2周
}
