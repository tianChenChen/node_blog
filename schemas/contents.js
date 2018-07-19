var mongoose =  require('mongoose');

// 分类的表结构
module.exports = new mongoose.Schema({

  // 关联字段 - 内容分类的id
  category:{
    // 类型
    type: mongoose.Schema.Types.ObjectId,
    // 引用
    ref: 'Category'
  },

  // 内容标题
  title: String,

  //关联字段 - 用户id
  user: {
    // 类型
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  addTime: {
    type: Date,
    default: new Date()
  },  

  // 阅读量
  views:{
    type: Number,
    default: 0
  },

  // 简介
  description:{
    type: String,
    default: ''
  },

  // 内容
  content: {
    type: String,
    default: ''
  }

})