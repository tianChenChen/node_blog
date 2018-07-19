//加载express模块
var express = require('express');
// 加载模板处理模块
var swig = require('swig');
// 加载数据可模块
var mongoose = require('mongoose');
// 加载body-parser,用来处理post提交过来的数据
var bodyParser = require('body-parser');
// 加载cookies 模块
var cookies = require('cookies')
//创建app应用 => NODEJS Http.createServer();
var app = express();
var User = require('./models/user')

app.use('/public', express.static(__dirname + '/public'));

app.engine('html', swig.renderFile);
app.set('views', './views');
app.set('view engine','html');
// 在开发过程中，需要取消模板缓存
swig.setDefaults({cache: false});

app.use(bodyParser.urlencoded({extended:true}));

// 设置cookie
app.use(function(req, res, next){
  req.cookies = new cookies(req, res);

  // 捷信登录用户的
  req.userInfo = {}
  if (req.cookies.get('userInfo')) {
    try{
      req.userInfo = JSON.parse(req.cookies.get('userInfo'))

      // 获取当前登录用户的类型，是否是管理元
      User.findById(req.userInfo._id).then(function(userInfo){
        req.userInfo.isAdmin =  Boolean(userInfo.isAdmin)
        next();
      })
    }catch(e) {
      next();
    }
  } else {
    next()
  }

  
})

app.use('/admin',require('./router/admin'));
app.use('/api',require('./router/api'));
app.use('/',require('./router/main'));

mongoose.connect('mongodb://localhost:27017/blog', function(err){
  if (err) {
    console.log('数据库链接失败')
  } else {
    console.log('数据可链接成功')
    app.listen(8081);
  }
});

