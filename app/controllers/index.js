var Movie = require('../models/movie')
var Category = require('../models/Category')
const searchPageSize = 2

// index page
exports.index = function(req, res) {
  Category
    .find({})
    .populate({
      path: 'movies',
      options: {limit: 6}
    })
    .exec(function(err, categories) {
      if (err) {
        console.log(err);
      }
      res.render('index', {
        title: 'movies 小站',
        categories: categories
      })
    })
}

// search
exports.search = function(req, res) {
  var categoryId = req.query.category
  var page = parseInt(req.query.page, 10) || 0
  var index = page * searchPageSize
  var q = req.query.q

  if(categoryId) {
    Category
      .findOne({_id: categoryId})
      .populate({
        path: 'movies',
        select: 'title poster'
        // options: {limit: 2, skip: index}
      })
      .exec(function(err, category) {
        if(err) {
          console.log(err);
        }
        var movies = category.movies.slice(index, index+searchPageSize)
        res.render('results', {
          title: '搜索结果列表页',
          keyword: category.name,
          currentPage: page,
          totalPage: Math.ceil(category.movies.length / searchPageSize),
          movies: movies,
          query: 'category=' + category._id
        })
      })
  } else {// 搜索框
    Movie
      .find({title: new RegExp(q + '.*', 'i')})
      .exec(function(err, movies) {
        if(err) {
          console.log(err);
        }
        var results = movies.slice(index, index+searchPageSize)
        res.render('results', {
          title: '搜索结果列表页',
          keyword: q,
          currentPage: page,
          totalPage: Math.ceil(movies.length / searchPageSize),
          movies: results,
          query: 'q=' + q
        })
      })
  }

}
