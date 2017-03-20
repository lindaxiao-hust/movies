var express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var logger = require('morgan')
// var cookieParser = require('cookie-parser')
var session = require('express-session')
var mongoStore = require('connect-mongo')(session)
var serveStatic = require('serve-static')

var fs = require('fs')
var port = process.env.PORT || 3000
var app = express()
var dbUrl = 'mongodb://localhost/movies'

mongoose.Promise = global.Promise
mongoose.connect(dbUrl)

// models loading
var models_path = __dirname + '/app/models'
var walk = function(path) {
  fs
    .readdirSync(path)
    .forEach(function(file) {
      var newPath = path + '/' + file
      var stat = fs.statSync(newPath)

      if(stat.isFile()) {
        if(/(.*)\.(js|coffee)/.test(file)) {
          require(newPath)
        }
      } else if(stat.isDirectory()) {
        walk(newPath)
      }
    })
}
walk(models_path)

app.set('views', './app/views/pages')
app.set('view engine', 'jade')
app.use(bodyParser.urlencoded({extended: true}))
// app.use(cookieParser())
app.use(session({
  secret: 'movies',
  resave: false,
  saveUninitialized: true,
  store: new mongoStore({
    url: dbUrl,
    collection: 'sessions'
  })
}))

var env = process.env.NODE_ENV || 'development'
if('development' === env) {
  app.set('showStackError', true)
  app.use(logger(':method :url :status'))
  app.locals.pretty = true
  mongoose.set('debug', true)
}

require('./config/routes')(app)

app.listen(port)
app.locals.moment = require('moment')
app.use(serveStatic(path.join(__dirname, 'public')))

console.log('movies starts on port ' + port);
