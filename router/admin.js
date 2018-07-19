var express = require('express');
var router = express.Router();

var User = require('../models/user')
var Category = require('../models/Category')
var Content = require('../models/Content')

router.use(function(req, res, next){
  if (!req.userInfo.isAdmin) {
    // 如果当前用户是非管理员
    res.send('对不起，只有管理员才能进入后台管理')
    return
  }
  next()
})

// 首页
router.get('/', function(req, res, next){
  res.render('admin/index', {
    userInfo: req.userInfo
  })
});

// 用户管理
router.get('/user', function(req, res){

  // 限制获取数据条数 limit()
  // skip(2): 忽略数据的条数
  /*
    每条显示2调
    1：1-2 skip:0 ->(当前页-1)*linmit
    2： 3-4 skip:2
  */

  // 从数据库中读取所有的用户数据
  var page = Number(req.query.page || 1);
  var limit = 1;
  var skip = (page -1)*limit
  var pages = 0
  User.count().then(function(count){
    // 计算总页数
    pages = parseInt(count / limit);
    // 取值不能超过pages
    page = Math.min(page, pages);
    // 取值不能小于1
    page = Math.max(page, 1);

    var skip = (page - 1) * limit

    User.find().limit(limit).skip(skip).then(function(users){
      res.render('admin/user_index', {
        userInfo: req.userInfo,
        users: users,
        
        count: count,
        pages: pages,
        limit: limit,
        page: page
      })
    })
  })
})
  
// 分类首页
router.get('/category', function(req, res){
  // 从数据库中读取所有的用户数据
  var page = Number(req.query.page || 1);
  var limit = 2;
  var skip = (page -1)*limit
  var pages = 0
  Category.count().then(function(count){
    // 计算总页数
    pages = parseInt(count / limit);
    // 取值不能超过pages
    page = Math.min(page, pages);
    // 取值不能小于1
    page = Math.max(page, 1);

    var skip = (page - 1) * limit

    // 1: 升序  -1：降序
    Category.find().sort({_id: -1}).limit(limit).skip(skip).then(function(categories){
      res.render('admin/category_index', {
        userInfo: req.userInfo,
        categories: categories,
        
        count: count,
        pages: pages,
        limit: limit,
        page: page
      })
    })
  })
})

// 分类添加
router.get('/category/add', function(req, res){
  res.render('admin/category_add', {
    userInfo: req.userInfo
  })
})

// 分类保存
router.post('/category/add', function(req,res){
  var name = req.body.name || '';

  if (name == '') {
    res.render('admin/error',{
      userInfo: req.userInfo,
      message: '名称不能空'
    })
    return;
  }

  //数据库是否已经存在同名分类名称
  Category.findOne({
    name: name
  }).then(function(rs){
    if (rs) {
      // 数据库中已经存在该分类了
      res.render('admin/error',{
        userInfo: req.userInfo,
        message: '分类已经存在了'
      })
      return Promise.reject();
    } else {
      // 数据库中不存在该分类，可以保存
      return new Category({
        name: name
      }).save();
    }
  }).then(function(newcate){
    res.render('admin/success',{
      userInfo: req.userInfo,
      message: '分类保存成功',
      url: '/admin/category'
    })
  })
})
  
// 分类修改
router.get('/category/edit', function(req, res){
  // 获取要修改的分类的信息，并且用表单的形式展示出来
  var id =  req.query.id || '';
  Category.findOne({
    _id: id
  }).then(function(category){
    if (!category) {
      res.render('admin/error',{
        userInfo: req.userInfo,
        message: '分类信息不存在',
      })
      // return Promise.reject()
    } else {
      res.render('admin/category_edit',{
        userInfo: req.userInfo,
        category: category
      })
    }
  })
})

// 分类的修改保存
router.post('/category/edit', function(req,res){
  // 获取修改的id
  var id = req.query.id || ''
  var name = req.body.name || ''

  Category.findOne({
    _id: id
  }).then(function(category){
    if (!category) {
      res.render('admin/error',{
        userInfo: req.userInfo,
        message: '分类信息不存在'
      })
      return Promise.reject()
    } else {
      // 没有修改就点击提交
      if (name == category.name) {
        res.render('admin/error',{
          userInfo: req.userInfo,
          message: '修改成功',
          url: '/admin/category'
        })
        return Promise.reject()
      } else {
        // 要修改的分类名称是否已经在数据中存在
        return Category.findOne({
          _id: {$ne: id},
          name: name
        })
      }
      
    }
  }).then(function(sameCategory){
    if (sameCategory) {
      res.render('admin/error',{
        userInfo: req.userInfo,
        message: '数据库中已经存在同名分类'
      })
      return Promise.reject()
    } else {
      return Category.update({
        _id: id
      },{
        name: name
      })
    }
  }).then(function(){
    res.render('admin/success',{
      userInfo: req.userInfo,
      message: '修改成功',
      url: '/admin/category'
    })
  })
})

// 分类删除
router.get('/category/delete',function(req,res){
  var id = req.query.id || '';

  Category.remove({
    _id: id
  }).then(function(){
    res.render('admin/success',{
      userInfo: req.userInfo,
      message: '删除成功',
      url: '/admin/category'
    })
  })
})

//内容首页
router.get('/content', function(req,res){

  // 从数据库中读取所有的用户数据
  var page = Number(req.query.page || 1);
  var limit = 10;
  var skip = (page -1)*limit
  var pages = 0
  Content.count().then(function(count){
    // 计算总页数
    pages = parseInt(count / limit);
    // 取值不能超过pages
    page = Math.min(page, pages);
    // 取值不能小于1
    page = Math.max(page, 1);

    var skip = (page - 1) * limit

    Content.find().limit(limit).skip(skip).populate(['category', 'user']).then(function(contents){

      res.render('admin/content_index', {
        userInfo: req.userInfo,
        contents: contents,
        
        count: count,
        pages: pages,
        limit: limit,
        page: page
      })
    })
  })

})

// 内容添加
router.get('/content/add', function(req, res){

  Category.find().sort({_id: -1}).then(function(categories){
    res.render('admin/content_add',{
      userInfo: req.userInfo,
      categories: categories
    })
  })
})

// 内容保存
router.post('/content/add',function (req, res){

  if (req.body.category == '') {
    res.render('admin/error',{
      userInfo:req.userInfo,
      message: '内容分类不能为空'
    })
    return
  }

  if (req.body.title == '') {
    res.render('admin/error',{
      userInfo: req.userInfo,
      message: '内容标题不能为空'
    })
    return
  }
  // 保存数据到数据库
  new Content({
    category: req.body.category,
    title: req.body.title,
    user: req.userInfo._id.toString(),
    description: req.body.description,
    content: req.body.content
  }).save().then(function(rs){
    res.render('admin/success',{
      userInfo: req.userInfo,
      message: '内容保存成功！',
      url: '/admin/content'
    })
  })
})

//内容编辑
router.get('/content/edit',function(req, res){
  var id = req.query.id || ''
  console.log(id,'id')
  var categories = [];
  Category.find().sort({_id: -1}).then(function(category){
    categories = category
    return Content.findOne({
      _id: id
    }).populate('category');
  }).then(function(content){
    console.log(content, 'content')
    if (!content) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '指定内容不存在'
      })
      return Promise.reject()
    } else {
      res.render('admin/content_edit',{
        userInfo: req.userInfo,
        categories: categories,
        content: content
      })
    }
  })
})

// 保存编辑内容
router.post('/content/edit', function(req,res){
  var id = req.query.id || ''
  if (req.body.category == '') {
    res.render('admin/error',{
      userInfo:req.userInfo,
      message: '内容分类不能为空'
    })
    return
  }

  if (req.body.title == '') {
    res.render('admin/error',{
      userInfo: req.userInfo,
      message: '内容标题不能为空'
    })
    return
  }

  Content.update({
    _id: id
  },{
    category: req.body.category,
    title: req.body.title,
    description: req.body.description,
    content: req.body.content
  }).then(function(){
    res.render('admin/success',{
      userInfo: req.userInfo,
      message: '内容保存成功',
      url: '/admin/content/edit?id=' + id
    })
  })
})

// 内容删除
router.get('/content/delete',function(req, res) {
  var id = req.query.id || ''
  Content.remove({
    _id: id
  }).then(function(){
    res.render('admin/success',{
      userInfo: req.userInfo,
      message: '删除成功',
      url: '/admin/content'
    })
  })
})

module.exports = router