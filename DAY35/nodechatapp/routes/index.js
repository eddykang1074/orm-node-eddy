var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/*
-모든 사용자 대상 채팅 페이지 호출 라우팅 메소드
-호출주소: http://localhost:3000/chat
*/
router.get('/chat', function(req, res, next) {
  res.render('chat');
});


  
/*
  -그룹 채팅-채팅방 기반 채팅 페이지 호출 라우팅 메소드
  -호출주소: http://localhost:3000/groupchat
*/
router.get('/groupchat', function(req, res, next) {
  res.render('groupchat');
});


module.exports = router;
