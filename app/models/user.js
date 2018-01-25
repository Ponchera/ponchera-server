const Kamora = require('kamora')
const moment = require('moment')

const Schema = Kamora.Database.Schema

const userSchema = new Schema({
  username: String,
  password: String,
  socket_id: String,
  application_id: {
    type: Schema.Types.ObjectId,
    ref: 'application'
  },
  contacts: [String],
  conversations: [{
    type: Schema.Types.ObjectId,
    ref: 'conversation'
  }],
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

userSchema.pre('save', function (next) {
  const time = Date.now()
  if (this.isNew) {
    this.created_at = time
  }
  this.updated_at = time
  next()
})

userSchema.set('toJSON', {
  getters: true,
  virtuals: true,
  transform: (doc, ret, options) => {
    ret.id = ret._id
    delete ret._id
    delete ret.password
    delete ret.socket_id
    delete ret.contacts
    delete ret.conversations
  }
})

module.exports = Kamora.Database.model('user', userSchema)
