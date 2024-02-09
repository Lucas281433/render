const mongoose = require('mongoose')

const url = process.env.MONGODB_URI
mongoose.set('strictQuery', false)
mongoose
  .connect(url)
  .then(() => {
    console.log('Connected with MongoDB')
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: (n) => {
        return /^(\d{2}-\d{6}|\d{3}-d{6})$/.test(n)
      },
      message: (props) =>
        `${props.value} The number must be prefixed with 2 or 3 numbers!`,
    },
    required: [true, 'User Phone number required'],
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

personSchema.path('name').validate((name) => {
  if (name.length < 3) {
    throw new Error(
      'Path `name` `{VALUE}` is shorter than the minimun allowed length (3)'
    )
  }
  return true
}, 'Person validation failed: Name: Path `name` `{VALUE}` is shorter than the minimun allowed length (3)')

const Person = mongoose.model('Person', personSchema)

module.exports = Person
