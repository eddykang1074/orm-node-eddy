//productAPI.JS의 기본호출주소는 http://localhost:3000/api/product/~
//app.js에서 라우터추가시 기본주소 설정

var express = require('express');
var router = express.Router();


/*
-기능: 상품 목록 데이터에 대한 요청과 응답처리 라우팅 메소드
-요청방식: GET
-요청주소: http://localhost:3000/api/product/list
-응답결과: 상품목록 JSON데이터 목록 
*/
router.get('/list',async(req,res)=>{

    var products =[
      {
        pid:1,
        pname:"LG 노트북",
        price:5000,
        stock:4
      },
      {
        pid:2,
        pname:"삼성 노트북",
        price:6000,
        stock:2
      }
    ];
  
    //res.json('json데이터=배열이든 단일객체든 상관없다')메소드는 지정한 json데이터를 브라우저로 전송해준다.
    res.json(products);
});
  


module.exports = router;