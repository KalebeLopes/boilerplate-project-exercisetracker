mongoose = require('mongoose')

class Database {

  constructor (url) {
    this.url = url
  }

  createConnection = () => {
    mongoose.connect(this.url, {useNewUrlParser: true})
    console.log('created connection')
  }

}

module.exports = Database
