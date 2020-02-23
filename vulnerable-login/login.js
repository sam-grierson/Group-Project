const sqlite3 = require('sqlite3').verbose()
const express = require('express')
const session = require('express-session')
const path = require('path')

// setup express
const app = express()
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}))
app.use(express.urlencoded({extended: true}))
app.use(express.json())



// display login page
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'))
})

// handle client post request
app.post('/auth', function(req, res) {
  let username = req.body.username
  let password = req.body.password
  let sql = `SELECT * FROM users WHERE username = ? AND password = ?`

  if (username && password) {
    // connect to database
    let db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
      return console.error(err.message)
    }
    console.log('Connected to users database')
    })

    // validate login information against database
    db.get(sql, [username, password], (err, row) => {
      if (err) {
        return console.error(err.message)
      } else if (!row) {
        res.send('Enter Username and Password')
        res.end()
      } else {
        req.session.loggedin = true
        req.session.username = username
        res.send('Welcome ' + req.session.username)
      }
      res.end()
    })

    // close database connection
    db.close((err) => {
    if (err) {
      return console.error(err.message)
    }
    console.log('Close database connection')
    })
  } 
})

// listen for incomming connections on port 3000
app.listen(3000)