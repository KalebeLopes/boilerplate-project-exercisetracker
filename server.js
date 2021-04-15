require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require("body-parser")
const urlMongo = process.env.MONGO_URL 
const User = require('./models/user')
const Database = require('./database.js')
const Exercise = require('./models/exercise')

const database = new Database(urlMongo)
database.createConnection()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})


async function findUser(key = {}) { // promisse
  // console.log(key)
  try {
    const userFinded = await User.findOne(key)
    // console.log('1', userFinded)
    return userFinded
  } catch(err) {
      return err
  }

}

app.post('/api/exercise/new-user', (req, res) => {
  const userName = req.body.username
  console.log(req.body)

  if (userName == '') 
    res.send('Path `username` is required.')

  async function createUser() {
    const key = {
      username: userName
    }
    const user = await findUser(key)
    // console.log('2', user)
    if (user)
      return res.send('Username already taken')

    const newUser = new User({
      username: userName
    })

    newUser.save()

    console.log('username: ' +  newUser.username + ' id: ' + newUser._id )

    res.json({
      username: newUser.username,
      _id: newUser._id
    })

  }

  createUser()
  
})

app.post('/api/exercise/add', (req, res) => {
  const userIdBody = req.body.userId
  const userDescription = req.body.description
  const userDuration = req.body.duration
  let userDate = req.body.date

  console.log(req.body)

  async function addExercice() {
    const key = {
      _id: userIdBody
    } 

    const user = await findUser(key)
    
    if(user.message)
      return res.send(user.message)

    if(userDescription == '')
      return res.send('Path `description` is required.')
    
    if(userDuration == '')
      return res.send('Path `duration` is required.')
    
    if(!userDate || userDate == null || userDate == ' ') {
      userDate = new Date()
      // .split(' ')
      // userDate = userDate[0] + ' ' + userDate[1] + ' ' + userDate[2] + ' ' + userDate[3]     
    } else {
      userDate = new Date(userDate)
      // .split('-') 
      // console.log(userDate)
      // let date = new Date(userDate[0], userDate[1], userDate[2])
      // console.log(date.getFullYear())
      // date = date.split(' ')
      // var weekday = new Array(7)
      // weekday[0] = "Sun"
      // weekday[1] = "Mon"
      // weekday[2] = "Tues"
      // weekday[3] = "Wed"
      // weekday[4] = "Thurs"
      // weekday[5] = "Fri"
      // weekday[6] = "Sat"

      // var month = new Array()
      // month[0] = "Jan"
      // month[1] = "Feb"
      // month[2] = "Mar"
      // month[3] = "Apr"
      // month[4] = "May"
      // month[5] = "Jun"
      // month[6] = "Jul"
      // month[7] = "Aug"
      // month[8] = "Sep"
      // month[9] = "Oct"
      // month[10] = "Nov"
      // month[11] = "Dec"

      // userDate =  weekday[date.getDay()] + ' ' + month[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear()
      // console.log('aq', userDate)
    }
    console.log(userDate) 

    const newExercise = new Exercise({
      userId: userIdBody,
      description: userDescription,
      duration: userDuration,
      date: userDate
    })

    await newExercise.save()

    console.log({
      _id: user._id,
      username: user.username,
      date: userDate.toDateString(),
      duration: newExercise.duration,
      description: newExercise.description
    })

    return res.json({
      _id: user._id,
      username: user.username,
      date: userDate.toDateString(),
      duration: newExercise.duration,
      description: newExercise.description
    })
  } 

  addExercice()

})

app.get('/api/exercise/users', (req, res) => {
  User.find({}).then((users) => {
    res.json(users)
  })  
})

app.use('/api/exercise/log', (req, res, next) => {
  const username = async () => {
    const username = await User.find({_id: req.query.userId})
    req.username = username[0].username
    next()
  } 

  username()
  
})

app.get('/api/exercise/log', (req, res) => {
  const {userId, fromDate, toDate, limit} = req.query
  const username = req.username

  const logExercise = async () => {
    const arrayExercises = await Exercise.find({userId: userId})
    let arrayExercisesRefactored = []
    if (limit)
      arrayExercisesRefactored = arrayExercises.slice(0,limit)
    else 
      arrayExercisesRefactored = arrayExercises
      
    arrayExercisesRefactored = arrayExercisesRefactored.map(field => {
      return {
        description: field.description,
        duration: field.duration,
        date: field.date
      }
    })
    // console.log(arrayExercisesRefactored)
    const count = arrayExercises.length
    const log = {
      _id: userId,
      username: username,
      count: count,
      log: arrayExercisesRefactored
    }

    res.json(log)
  }
  
  logExercise()

})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

