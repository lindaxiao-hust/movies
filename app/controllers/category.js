var Category = require('../models/category')

// admin new category
exports.new = function(req, res) {
  res.render('category_admin', {
    title: 'movies 后台分页录入页',
    category: {}
  })
}

// admin save category
exports.save = function(req, res) {
  var _category = req.body.category

  var category = new Category(_category)

  category.save(function(err, category) {
    if(err) {
      console.log(err);
    }
    res.redirect('/admin/category/list')
  })
}

// admin category list
exports.list = function(req, res) {
  Category.fetch(function(err, categories) {
    if(err) {
      console.log(err);
    }
    res.render('category_list', {
      title: 'movies 分类列表页',
      categories: categories
    })
  })
}
