require('mongoose')

const exerciseSchema = mongoose.Schema({
  userId: String,
  description: String, 
  duration: Number,
  date: String
})

const Exercise = new mongoose.model('Exercise', exerciseSchema)

module.exports = Exercise