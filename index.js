const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')

const app = express()

morgan.token('body', function (req) {
  return JSON.stringify(req.body)
})

app.use(express.static('dist'))
app.use(cors())
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
)
app.use(express.json())

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons)
    })
    .catch((error) => {
      next(error)
    })
})

app.get('/api/info', (request, response, next) => {
  Person.countDocuments({})
    .then((count) => {
      response.send(
        `<p>Phonebook has info for ${count}</p><p>${new Date()}</p>`
      )
    })
    .catch((error) => {
      next(error)
    })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then((personFound) => {
    if (personFound) {
      response.json(personFound)
    } else {
      response.status(204).end()
    }
  })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => {
      next(error)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const newPerson = {
    name: body.name,
    number: body.number,
  }

  const opts = { runValidators: true }

  Person.findByIdAndUpdate(request.params.id, newPerson, opts, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson)
    })
    .catch((error) => {
      next(error)
    })
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  const opts = { runValidators: true }

  Person.findOne({ name: body.name }).then((repeatedPerson) => {
    if (repeatedPerson) {
      Person.findByIdAndUpdate(request.params.id, person, opts, { new: true })
        .then((updatedPerson) => {
          response.json(updatedPerson)
        })
        .catch((error) => {
          next(error)
        })
    } else {
      person
        .save()
        .then((savedPerson) => {
          response.json(savedPerson)
        })
        .catch((error) => {
          next(error)
        })
    }
  })
})

const errorHandler = (error, request, response, next) => {
  console.error(error.name)
  if (error.name === 'CastError') {
    response.status(400).send({ error: 'malformated id' })
  } else if (error.name === 'ValidationError') {
    response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`)
})
