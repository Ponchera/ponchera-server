const Kamora = require('kamora')
const moment = require('moment')

const Schema = Kamora.Database.Schema

const conversationSchema = new Schema({
  cid: String,
  name: String,
  creator: String,
  members: [String],
  application_id: {
    type: Schema.Types.ObjectId,
    ref: 'application'
  },
  ext: {},
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

conversationSchema.pre('save', function (next) {
  const time = Date.now()
  if (this.isNew) {
    this.created_at = time
  }
  this.updated_at = time
  next()
})

conversationSchema.set('toJSON', {
  getters: true,
  virtuals: true,
  transform: (doc, ret, options) => {
    ret.id = ret._id
    delete ret._id
  }
})

module.exports = Kamora.Database.model('conversation', conversationSchema)
