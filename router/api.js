var express = require('express');
var router = express.Router();
var User =  require('../models/user')

// 统一返回格式
var responseData;

router.use(function(req, res, next){
  responseData ={
    code: 0,
    message: ''
  }

  next();
})

/*
  用户注册
   注册逻辑
   1.用户名不能为空
   2.密码不能为空
   3.两次输入密码必须一致

    1.用户是否已经被注册了
      数据库查询
    2.
*/
router.post('/user/register', function(req, res, next){

  var username = req.body.username;
  var password = req.body.password;
  var repassword = req.body.repassword;

  // 用户是否为空
  if(username == ''){
    responseData.code = 1;
    responseData.message = '用户名不能为空';
    res.json(responseData);
    return
  }

  //密码不能为空
  if(password == ''){
    responseData.code = 2;
    responseData.message = '密码不能为空';
    res.json(responseData);
    return;
  }

  //两次输入的密码必须一致
  if(password != repassword) {
    responseData.code = 3
    responseData.message = '两次输入的密码不一致'
    res.json(responseData);
    return;
  }

  // 如果数据库已经有这个用户名，我们需要提示用户名已存在
  User.findOne({
    username:username
  }).then(function(userInfo){
    if (userInfo) {
      // 表示数据可中有该记录
      responseData.code = 4;
      responseData.message = '用户名已经被注册了';
      res.json(responseData);
      return;
    }
    // 保存用户名
    var user = new User({
      username: username,
      password: password
    });
    return user.save();
  }).then(function(newUserInfo){
    responseData.message = '注册成功';
    res.json(responseData)
  })

})

router.post('/user/login', function(req, res, next){
  var username = req.body.username;
  var password =  req.body.password;

  // 用户名
  if (username == '') {
    responseData.code = 1
    responseData.message = '请输入用户名'
    res.json(responseData);
    return;
  }

  //密码
  if (password == '') {
    responseData.code = 2
    responseData.message = '请输入密码'
    res.json(responseData);
    return;
  }

  // 查询数据可中相同的用户名和密码的记录是否存在，如果存在则登录成功
  User.findOne({
    username: username,
    password: password
  }).then(function(result){
    if (!result) {
      responseData.code = 3
      responseData.message = '用户名或密码不正确'
      res.json(responseData)
      return
    }
    responseData.message = '登录成功'
    responseData.userInfo = {
      username: result.username,
      _id: result._id
    }
    req.cookies.set('userInfo', JSON.stringify({
      username: result.username,
      _id: result._id
    }))
    res.json(responseData)
  })
})

router.get('/user/logout', function(req, res, next){
  req.cookies.set('userInfo', null)
  res.json(responseData)
})

module.exports = router