//라우터의 기본주소는
//http://localhost:3000/articles/~

var express = require('express');
var router = express.Router();

/*
-기능:게시글 목록 웹페이지 요청과 응답 처리 라우팅메소드
-요청URL: http://localhost:3000/articles/
-요청유형: get
-응답결과: 게시글 목록 웹페이지
*/
router.get('/',async(req,res)=>{

    //게시글 목록 데이터
    //나중에 DB에서 가져옵니다.
    var articles =[
        {
            articleIdx:1,
            title:"첫번쨰 게시글입니다.",
            contents:"첫번쨰 게시글 내용입니다",
            view_cnt:100,
            display:"Y",
            ipaddress:"111.111.111.111",
            registDate:Date.now(),
            registMemberId:"eddy"
        },
        {
            articleIdx:2,
            title:"2번쨰 게시글입니다.",
            contents:"2번쨰 게시글 내용입니다",
            view_cnt:200,
            display:"Y",
            ipaddress:"222.111.111.111",
            registDate:Date.now(),
            registMemberId:"eddy2"
        },
        {
            articleIdx:3,
            title:"3번쨰 게시글입니다.",
            contents:"3번쨰 게시글 내용입니다",
            view_cnt:300,
            display:"Y",
            ipaddress:"123.111.111.111",
            registDate:Date.now(),
            registMemberId:"eddy"
        }
    ];

    res.render('article/list.ejs',{articles});
});


/*
-기능:신규 게시글 등록 웹페이지 요청과 응답 처리 라우팅메소드
-요청URL: http://localhost:3000/articles/create
-요청유형: get
-응답결과: 신규 게시글 등록 웹페이지
*/
router.get('/create',async(req,res)=>{
    res.render('article/create');
});


/*
-기능:신규 게시글 사용자 입력정보 등록 요청과 응답 처리 라우팅메소드
-요청URL: http://localhost:3000/articles/create
-요청유형: post
-응답결과: 게시글 목록 페이지로 이동처리
*/
router.post('/create',async(req,res)=>{

    var title = req.body.title;
    var contents = req.body.contents;
    var register = req.body.register;


    //DB입력 단일 데이터 생성 및 DB등록처리 
    var article = {
        articleIdx:0,
        title,
        contents,
        view_cnt:0,
        display:"Y",
        ipaddress:"111.111.111.111",
        registDate:Date.now(),
        registMemberId:register
    };

    //게시글 목록 페이지로 이동시킨다.
    res.redirect("/articles");

});


/*
-기능:선택 게시글 정보확인 웹페이지 요청과 응답 처리 라우팅메소드
-요청URL: http://localhost:3000/articles/modify/1
-요청유형: get
-응답결과: 선택 단일 게시글 정보 표시 웹페이지
*/
router.get('/modify/:aid',async(req,res)=>{
    
    //url을 통해 전달된 게시글 고유번호 추출
    var articleIdx = req.params.aid;

    //step2: 게시글 고유번호를 이용해 DB에서 게시글 정보를 조회해온다.


    //step3:조회해온 단일 게시글정보..
    var article = {
        articleIdx:articleIdx,
        title:"1번쨰 게시글 제목입니다.",
        contents:"1번쨰 게시글 내용입니다.",
        view_cnt:100,
        display:"Y",
        ipaddress:"111.111.111.111",
        registDate:Date.now(),
        registMemberId:"eddy"
    };

    res.render('article/modify',{article});
});


/*
-기능:게시글 수정페이지에서 사용자가 수정한 게시글 수정정보 처리 요청과 응답처리 라우팅메소드
-요청URL: http://localhost:3000/articles/modify/1
-요청유형: post
-응답결과: 게시글 목록 웹페이지
*/
router.post('/modify/:aid',async(req,res)=>{

    var articleIdx = req.params.aid;

    var title = req.body.title;
    var contents = req.body.contents;
    var register = req.body.register;


    //DB수정 단일 데이터 생성 및 DB 수정처리 
    var article = {
        articleIdx:articleIdx,
        title,
        contents,
        view_cnt:0,
        display:"Y",
        ipaddress:"111.111.111.111",
        registDate:Date.now(),
        registMemberId:register
    };

    //게시글 목록 페이지로 이동시킨다.
    res.redirect("/articles");

});


/*
-기능:게시글 삭제 요청과 응답 처리 라우팅메소드
-요청URL: http://localhost:3000/articles/delete?aidx=1
-요청유형: get
-응답결과: 게시글 목록 웹페이지
*/
router.get('/delete',async(req,res)=>{
    var articleIdx = req.query.aidx;

    //해당 게시글 번호를 이용해 DB에서 해당 게시글 삭제한다.

    //삭제완료후 게시글 목록 페이지로 이동한다.

    res.redirect("/articles");
});


module.exports = router;