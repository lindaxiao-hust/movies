var Movie = require('../models/movie')
var Comment = require('../models/comment')
var Category = require('../models/category')
var _ = require('underscore')
var fs = require('fs')
var path = require('path')

// detail page
exports.detail = function(req, res) {
  var id = req.params.id

  Movie.update({_id: id}, {$inc: {pv: 1}}, function(err) {
    if(err) {
      console.log(err);
    }
  })
  
  Movie.findById(id, function(err, movie) {
    if (err) {
      console.log(err);
    } else {
      Comment
        .find({
          movie: id
        })
        .populate('from', 'name')
        .populate('reply.from reply.to', 'name')
        .exec(function(err, comments) {
          console.log(comments);
          res.render('detail', {
            title: movie.title,
            movie: movie,
            comments: comments
          })
        })
    }
  })
}

// admin new page
exports.new = function(req, res) {
  Category.fetch(function(err, categories) {
    res.render('admin', {
      title: 'movies 后台录入页',
      categories: categories,
      movie: {}
    })
  })
}

// admin update movie
exports.update = function(req, res) {
  var id = req.params.id

  if (id) {
    Movie.findById(id, function(err, movie) {
      Category.fetch(function(err, categories) {
        res.render('admin', {
          title: 'movies 后台更新页',
          categories: categories,
          movie: movie
        })
      })
    })
  }
}

exports.savePoster = function(req, res, next) {
  var posterData = req.files.uploadPoster
  var filePath = posterData.path
  var originalFilename = posterData.originalFilename

  if(originalFilename) {
    fs.readFile(filePath, function(err, data) {
      var timestamp = Date.now()
      var type = posterData.type.split('/')[1]
      var poster = timestamp + '.' + type
      var newPath = path.join(__dirname, '../../', '/public/upload/' + poster)
      fs.writeFile(newPath, data, function(err) {
        req.poster = poster
        next()
      })
    })
  } else {
    next()
  }
}

// admin post movies
exports.save = function(req, res) {
  console.log(req.body);
  var id = req.body.movie._id
  var movieObj = req.body.movie
  var _movie = {}

  if(req.poster) {
    movieObj.poster = req.poster
  }

  if (id) { // 电影存在，更改
    Movie.findById(id, function(err, movie) {
      if (err) {
        console.log(err);
      }

      // 使用underscore中的extend方法可以将movieObj中的字段覆盖movie中的字段
      _movie = _.extend(movie, movieObj)
      _movie.save(function(err, movie) {
        if (err) {
          console.log(err);
        }
        res.redirect('/movie/' + id)
      })
    })
  } else { // 新增电影
    _movie = new Movie(movieObj)

    var categoryId = movieObj.category
    var categoryName = movieObj.categoryName
    _movie.save(function(err, movie) {
      if (err) {
        console.log(err);
      }
      if(categoryId) {
        Category.findById(categoryId, function(err, category) {
          category.movies.push(_movie._id)
          category.save(function(err, category) {
            res.redirect('/movie/' + movie._id)
          })
        })
      } else if(categoryName){
        var category = new Category({
          name: categoryName,
          movies: [_movie._id]
        })

        category.save(function(err, category) {
          movie.category = category._id
          movie.save(function(err, movie) {
            res.redirect('/movie/' + movie._id)
          })
        })
      }
    })
  }
}

// list page
exports.list = function(req, res) {
  Movie.fetch(function(err, movies) {
    if (err) {
      console.log(err);
    }
    res.render('list', {
      title: 'movies 列表',
      movies: movies
    })
  })
}

//list delete movie
exports.del = function(req, res) {
  var id = req.query.id

  if (id) {
    Movie.remove({
      _id: id
    }, function(err, movie) {
      if (err) {
        console.log(err);
      } else {
        res.json({
          success: 1
        })
      }
    })
  }
}
