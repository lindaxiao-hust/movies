var index = require('../app/controllers/index')
var user = require('../app/controllers/user')
var movie = require('../app/controllers/movie')
var comment = require('../app/controllers/comment')
var category = require('../app/controllers/category')
var multipart = require('connect-multiparty')
var multipartMiddleware = multipart()

module.exports = function(app) {

  // pre handle user
  app.use(function(req, res, next) {
    app.locals.user = req.session.user
    next()
  })

  // index
  app.get('/', index.index)

  // user
  app.post('/user/signup', user.signup)
  app.post('/user/signin', user.signin)
  app.get('/signin', user.showSignin)
  app.get('/signup', user.showSignup)
  app.get('/logout', user.logout)
  app.get('/admin/user/list', user.signinRequired, user.adminRequired, user.list)


  // movie
  app.get('/movie/:id', movie.detail)
  app.get('/admin/movie/new', user.signinRequired, user.adminRequired, movie.new)
  app.get('/admin/movie/update/:id', user.signinRequired, user.adminRequired, movie.update)
  app.post('/admin/movie', multipartMiddleware, user.signinRequired, user.adminRequired, movie.savePoster, movie.save)
  app.get('/admin/movie/list', user.signinRequired, user.adminRequired, movie.list)
  app.delete('/admin/movie/list', user.signinRequired, user.adminRequired, movie.del)

  // comment
  app.post('/user/comment', user.signinRequired, comment.save)

  // category
  app.get('/admin/category/new', user.signinRequired, user.adminRequired, category.new)
  app.post('/admin/category', user.signinRequired, user.adminRequired, category.save)
  app.get('/admin/category/list', user.signinRequired, user.adminRequired, category.list)

  // results
  app.get('/results', index.search)
}
