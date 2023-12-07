var express = require('express');
var router = express.Router();

//상품목록  웹페이지 요청과 응답 라우팅 메소드
//localhost:3000/product/list
router.get('/list',async(req,res)=>{
    res.render('product/list');
});


//단일상품 상세정보 보기 웹페이지에 대한 요청과 응답하기
//localhost:3000/product/detail?pid=1&pname=lg노드북
router.get('/detail',async(req,res)=>{

    //URL에 쿼리스트링방식으로 전달된값 추출하기
    var productID = req.query.pid;
    var productName = req.query.pname;

    res.render('product/detail',{productID,productName});
});



module.exports = router;