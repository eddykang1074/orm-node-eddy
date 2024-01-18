var express = require('express');
var router = express.Router();

/* 디폴트 메인 페이지  */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



/*
-서버 소켓과 연결된 모든 사용자간 채팅하기 웹페이지 요청과 응답
-http://localhost:3000/chat
*/
router.get('/chat',async(req,res,next)=>{
  res.render('chat.ejs');
});


/*
-특정 채팅방(채널) 사용자간 채팅하기 웹페이지 요청과 응답
-http://localhost:3000/groupchat
*/
router.get('/groupchat',async(req,res,next)=>{
  res.render('groupchat.ejs');
});



module.exports = router;
