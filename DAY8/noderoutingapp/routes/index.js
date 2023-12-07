var express = require('express');
var router = express.Router();

/* 메인 페이지 요청과 응답처리 라우팅 메소드  */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


//콜백함수를 router.get()메소드의 파라메터(매개변수)로 호출주소와 콜백함수를 전달해서
//router.get()메소드가 요청과 응답을 처리하게한다.
//기본 콜백함수를 전달해서 진행됨.
router.get('/main',(req,res)=>{
  res.render('index.ejs', { title: '메인 페이지' });
});

//콜백함수가 아닌 async,await방식을 통한 router.get()메소드를 실행하는방법
//비동기 프로그래밍의 절차중심 기능개발시 promise 또는 async/await이란 방식을 이용하면
//비동기 프로그래밍 환경에서 순차적 프로그래밍 가능하다(콜백지옥없이)
router.get('/index',async(req,res)=>{
  res.render('index.ejs', { title: '인덱스 페이지' });
});



/*
-기능: 상품 목록 데이터에 대한 요청과 응답처리 라우팅 메소드
-요청방식: GET
-요청주소: http://localhost:3000/products
-응답결과: 상품목록 JSON데이터 목록 
*/
router.get('/products',async(req,res)=>{

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
