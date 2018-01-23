const Kamora = require('kamora')
const moment = require('moment')

const Schema = Kamora.Database.Schema

const organizationSchema = new Schema({
  username: {
    type: String,
    unique: true
  },
  password: String,
  created_at: {
    type: Date,
    default: Date.now(),
    get: v => moment(v)
  },
  updated_at: {
    type: Date,
    default: Date.now(),
    get: v => moment(v)
  }
}, { versionKey: false })

organizationSchema.pre('save', function (next) {
  const time = Date.now()
  if (this.isNew) {
    this.created_at = time
  }
  this.updated_at = time
  next()
})

organizationSchema.set('toJSON', {
  getters: true,
  virtuals: true,
  transform: (doc, ret, options) => {
    ret.id = ret._id
    delete ret._id
    delete ret.password
  }
})

module.exports = Kamora.Database.model('organization', organizationSchema)
