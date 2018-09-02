const Kamora = require('kamora')

const Schema = Kamora.Database.Schema

const idSchema = new Schema({
  table: String,
  index: Number
}, { versionKey: false })

idSchema.set('toJSON', {
  getters: true,
  virtuals: true,
  transform: (doc, ret, options) => {
    delete ret._id
  }
})

module.exports = Kamora.Database.model('id', idSchema)
