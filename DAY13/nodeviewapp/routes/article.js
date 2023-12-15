//게시글 정보관리 각종 웹페이지 요청과 응답처리 라우터 전용파일
//http://localhost:3000/article/~


var express = require('express');
var router = express.Router();

//게시글 목록 조회 웹페이지 요청 및 응답 라우팅메소드
//http://localhost:/article/list
//GET
router.get('/list',async(req,res)=>{

    var searchOption ={
        boardTypeCode:"0",
        title:"",
        isDisplayCode:"9"
    }


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
    res.render('article/list.ejs',{articles,searchOption});
});


//게시글 목록에서 조회옵션 데이터를 전달받아 조회옵션기반 게시글 목록 조회후
//게시글 목록 페이지에 대한 요청과 응답처리
//http://localhost:/article/list
//POST
router.post('/list',async(req,res)=>{

    //step1: 사용자가 선택/입력한 조회옵션 데이터를 추출한다.
    var boardTypeCode = req.body.boardTypeCode;
    var title = req.body.title;
    var isDisplayCode = req.body.isDisplayCode;

    var searchOption ={
        boardTypeCode,
        title,
        isDisplayCode
    }


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
    res.render('article/list.ejs',{articles,searchOption});
});


//신규 게시글 등록 웹페이지 요청 및 응답 라우팅 메소드
//http://localhost:3000/article/create
router.get('/create',async(req,res)=>{
    res.render('article/create.ejs');
});


//신규 게시글 사용자 등록정보 처리 요청 및 응답 라우팅메소드
router.post('/create',async(req,res)=>{

    //step1: 사용자가 입력한 게시글 등록 데이터 추출
    var boardTypeCode = req.body.boardTypeCode;
    var title = req.body.title;
    var contents = req.body.contents;
    var articleTypeCode = req.body.articleTypeCode;
    var isDisplayCode = req.body.isDisplayCode;
    var register = req.body.register;

    //step2:추출된 사용자 입력데이터를 단일 게시글 json데이터로 구성해서
    //DB article테이블에 영구적으로 저장처리한다.
    //저장처리후 article테이블에 저장된 데이터 반환됩니다.

    //등록할 게시글 데이터 
    var article ={
        boardTypeCode,
        title,
        contents,
        articleTypeCode,
        isDisplayCode,
        register,
        registDate:Date.now()
    };


    //step3:등록처리후 게시글 목록 웹페이지로 이동처리 
    res.redirect('/article/list');
});


//기존 게시를 삭제처리 요청 및 응답 라우팅메소드
//http://localhost:3000/article/delete?aid=3
router.get('/delete',async(req,res)=>{

    //step1: 삭제하려는 게시글 고유번호를 추출한다.
    var articleIdx = req.query.aid;

    //step2:게시번호기반으로 실제 DB article테이블에서 데이터를 삭제처리한다.

    //step3: 게시글 목록 페이지로 이동시킨다.
    res.redirect('/article/list');
});



//기존 게시글 정보 확인 및 수정 웹페이지 요청과 응답 라우팅 메소드 
//http://localhost:3000/article/modify/1
//GET
router.get('/modify/:aid',async(req,res)=>{
    
    //step1:선택한 게시글 고유번호를 파라메터 방식으로 URL을 통해 전달받음
    var articleIdx = req.params.aid;


    //step2:해당 게시글 번호에 해당하는 특정 단일게시글 정보를 DB article테이블에서 
    //조회해 온다.
    var article = {
        article_id:1,
        board_type_code:1,
        title:"공지게시글 1번글입니다.",
        contents:"공지게시글 1번 내용입니다.",
        view_count:10,
        ip_address:"111.111.124.44",
        is_display_code:1,
        article_type_code:1,
        reg_date:"2023-12-12",
        reg_member_id:"eddy"
    };

    //step3: 단일 게시글 정보르 뷰에 전달한다.
    res.render('article/modify.ejs',{article});
});


//기존 게시글 사용자 수정정보 처리 요청과 응답 라우팅 메소드 
//http://localhost:3000/article/modify/1
//POST
router.post('/modify/:aid',async(req,res)=>{

        //게시글 고유번호 URL파라메터에서 추출하기 
        var articleIdx = req.params.aid;

        //step1: 사용자가 입력한 게시글 등록 데이터 추출
        var boardTypeCode = req.body.boardTypeCode;
        var title = req.body.title;
        var contents = req.body.contents;
        var articleTypeCode = req.body.articleTypeCode;
        var isDisplayCode = req.body.isDisplayCode;
        var register = req.body.register;
    
        //step2:추출된 사용자 입력데이터를 단일 게시글 json데이터로 구성해서
        //DB article테이블에 수정처리한다.
        //수정 처리하면 처리건수값이 반환됩니다.
    
        //수정할 게시글 데이터 
        var article ={
            article_id:articleIdx,
            boardTypeCode,
            title,
            contents,
            articleTypeCode,
            isDisplayCode,
            register,
            registDate:Date.now()
        };
    
    
        //step3:수정처리후 게시글 목록 웹페이지로 이동처리 
        res.redirect('/article/list');

});



module.exports = router;