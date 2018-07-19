$(function(){
  var $loginBox = $('#loginBox')
  var $registerBox = $('#registerBox')
  var $logoutBtn = $('#logoutBtn')

  //切换到注册
  $loginBox.find('a.colMint').click(function(){
    $loginBox.hide()
    $registerBox.show()
  })

  //切换到登录
  $registerBox.find('a.colMint').click(function(){
    $loginBox.show()
    $registerBox.hide()
  })

  //注册
  $registerBox.find('button').on('click',function(){
    $.ajax({
      type:'post',
      url:'/api/user/register',
      data:{
        username: $registerBox.find('[name="username"]').val(),
        password: $registerBox.find('[name="password"]').val(),
        repassword: $registerBox.find('[name="repassword"]').val()
      },
      dataType:'json',
      success:function(result){
        console.log(result)
        $registerBox.find('.colWarning').html(result.message);
        if (!result.code) {
          setTimeout(function(){
            $loginBox.show()
            $registerBox.hide();
          }, 1000)
        }
      }
    })
  })

  //登录
  $loginBox.find('button').on('click',function(){
    $.ajax({
      url:'/api/user/login',
      type:'post',
      dataType:'json',
      data: {
        username: $loginBox.find('[name="username"]').val(),
        password: $loginBox.find('[name="password"]').val()
      },
      success:function(result){
        console.log(result)
        $loginBox.find('.colWarning').html(result.message);
        if (!result.code) {
          window.location.reload()
        }
      }
    })
  })

  // 退出
  $logoutBtn.on('click',function(){
    $.ajax({
      type:'get',
      url:'/api/user/logout',
      success: function(result){
        console.log(result)
        if (!result.code) {
          window.location.reload()
        }
      }
    })
  })
})