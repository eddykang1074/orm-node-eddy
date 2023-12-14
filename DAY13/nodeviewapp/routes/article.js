//게시글 정보관리 각종 웹페이지 요청과 응답처리 라우터 전용파일
//http://localhost:3000/article/~


var express = require('express');
var router = express.Router();

//게시글 목록 조회 웹페이지 요청 및 응답 라우팅메소드
//http://localhost:/article/list
//GET
router.get('/list',async(req,res)=>{

    //step1:DB에서 모든 게시글 데이터 목록을 조회해옵니다.

    const articles = [
        {
            article_id:1,
            board_type_code:1,
            title:"공지게시글 1번글입니다.",
            contents:"공지게시글 1번 내용입니다.",
            view_count:10,
            ip_address:"111.111.124.44",
            is_display_code:1,
            reg_date:"2023-12-12",
            reg_member_id:"eddy"
        },
        {
            article_id:2,
            board_type_code:2,
            title:"기술 블로깅 게시글 1번글입니다.",
            contents:"기술 게시글 1번 내용입니다.",
            view_count:20,
            ip_address:"222.111.124.44",
            is_display_code:0,
            reg_date:"2023-12-13",
            reg_member_id:"eddy"
        },
        {
            article_id:3,
            board_type_code:2,
            title:"기술 게시글 입니다.",
            contents:"기술 게시글 내용입니다.",
            view_count:30,
            ip_address:"123.111.124.44",
            is_display_code:1,
            reg_date:"2023-12-14",
            reg_member_id:"eddy"
        }
    ];

    //step2: 게시글 전체 목록을 list.ejs뷰에 전달한다.
    res.render('article/list.ejs',{articles});
});


//게시글 목록에서 조회옵션 데이터를 전달받아 조회옵션기반 게시글 목록 조회후
//게시글 목록 페이지에 대한 요청과 응답처리
router.post('/list',async(req,res)=>{

    //step1: 사용자가 선택/입력한 조회옵션 데이터를 추출한다.
    var boardTypeCode = req.body.boardTypeCode;
    var title = req.body.title;
    var isDisplayCode = req.body.isDisplayCode;

    //step2: 사용자가 입력/선택한 조회옵션 데이터를 기반으로 DB에서 게시글 목록을 재조회해온다.
    const articles = [
        {
            article_id:1,
            board_type_code:1,
            title:"공지게시글 1번글입니다.",
            contents:"공지게시글 1번 내용입니다.",
            view_count:10,
            ip_address:"111.111.124.44",
            is_display_code:1,
            reg_date:"2023-12-12",
            reg_member_id:"eddy"
        }
    ];

    //step3) 게시글 목록 페이지 list.ejs에 데이터 목록을 전달한다.
    res.render('article/list.ejs',{articles});
});


//신규 게시글 등록 웹페이지 요청 및 응답 라우팅 메소드
router.get('/create',async(req,res)=>{
    res.render('article/create.ejs');
});


//신규 게시글 사용자 등록정보 처리 요청 및 응답 라우팅메소드
router.post('/create',async(req,res)=>{
    //등록처리 
    res.redirect('/article/list');
});


//기존 게시를 삭제처리 요청 및 응답 라우팅메소드
//http://localhost:3000/article/delete?aid=3
router.get('/delete',async(req,res)=>{
    var articleIdx = req.query.aid;

    res.render('article/list.ejs');
});



//기존 게시글 정보 확인 및 수정 웹페이지 요청과 응답 라우팅 메소드 
router.get('/modify/:aid',async(req,res)=>{
    
    var articleIdx = req.params.aid;

    res.render('article/modify.ejs');
});


//기존 게시글 사용자 수정정보 처리 요청과 응답 라우팅 메소드 
router.post('/modify/:aid',async(req,res)=>{
    var articleIdx = req.params.aid;

    res.redirect('/article/list');
});



module.exports = router;