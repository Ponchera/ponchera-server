const Kamora = require('kamora')

const Schema = Kamora.Database.Schema

const messageSchema = new Schema({
  from: String,
  content: {},
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'conversation'
  },
  timestamp: Number
}, { versionKey: false })

messageSchema.set('toJSON', {
  getters: true,
  virtuals: true,
  transform: (doc, ret, options) => {
    delete ret._id
  }
})

module.exports = Kamora.Database.model('message', messageSchema)
