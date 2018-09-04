const Kamora = require('kamora')
const moment = require('moment')

const Schema = Kamora.Database.Schema

const roleSchema = new Schema({
  name: String,
  display_name: String,
  permissions: [{
    type: Schema.Types.ObjectId,
    ref: 'permission'
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

roleSchema.pre('save', function (next) {
  const time = Date.now()
  if (this.isNew) {
    this.created_at = time
  }
  this.updated_at = time
  next()
})

roleSchema.set('toJSON', {
  getters: true,
  virtuals: true,
  transform: (doc, ret, options) => {
    delete ret._id
  }
})

module.exports = Kamora.Database.model('role', roleSchema)
