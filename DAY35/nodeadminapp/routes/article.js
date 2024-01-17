//게시글 정보관리 각종 웹페이지 요청과 응답처리 라우터 전용파일
//http://localhost:3000/article/~

var express = require('express');
var router = express.Router();

var moment = require('moment');

//로그인 여부 체크 사용자 권한 세션 미들웨어 참조하기
//const {isLoggedIn,isNotLoggedIn} = require('./sessionMiddleware');

const {isLoggedIn,isNotLoggedIn} = require('./passportMiddleware');

//multer멀터 업로드 패키지 참조하기
var multer = require('multer');

//S3전용 업로드 객체 참조하기
var {upload} = require('../common/aws_s3');


//multer 파일저장위치 지정
var storage  = multer.diskStorage({ 
    destination(req, file, cb) {
      cb(null, 'public/upload/');
    },
    filename(req, file, cb) {
      cb(null, `${moment(Date.now()).format('YYYYMMDDHHMMss')}_${file.originalname}`);
    },
});


//multer 일반 업로드처리 객체 생성
var simpleUpload = multer({ storage: storage });



var db = require('../models/index');
var Op = db.Sequelize.Op;

var sequelize = db.sequelize;
const { QueryTypes } = sequelize;


//게시글 목록 조회 웹페이지 요청 및 응답 라우팅메소드
//http://localhost:3000/article/list
//GET
router.get('/list',isLoggedIn,async(req,res)=>{

    var searchOption ={
        boardTypeCode:"0",
        title:"",
        isDisplayCode:"9"
    }


    //step1:DB에서 모든 게시글 데이터 목록을 조회해옵니다.
    //db.Article.findAll()메소드는 article테이블에 모든 데이터를 조회하는 
    //SELECT article_id,,,, FROM article WHERE is_display_code AND view_count != 0; SQL 쿼리로 변환되어 DB서버에 전달되어 실행되고 그결과물을 반환한다. 
    var articles = await db.Article.findAll(
        {
            attributes: ['article_id','board_type_code','title','article_type_code','view_count','is_display_code','reg_date','reg_member_id'],
            // where:{
            //     is_display_code:1,
            //     view_count: {[Op.not]:0} 
            // },
            order: [['article_id', 'DESC']]  //DESC 오름차순 3,2,1, ASC 내림차순: 1,2,3
        }
    );


    // var sqlQuery = `SELECT 
    // article_id,board_type_code,title,article_type_code,view_count,ip_address,is_display_code,reg_date,reg_member_id
    // FROM article
    // WHERE is_display_code = 1
    // ORDER BY article_id DESC;`;

    // var articles = await sequelize.query(sqlQuery,{
    //     raw: true,
    //     type: QueryTypes.SELECT,
    // });

    // var articles = await sequelize.query("CALL SP_CHAT_ARTICLE_DISPLAY (:P_DISPLAY_CODE)",
    //     { replacements: { P_DISPLAY_CODE: 1 } });



    //Select Count(*) FROM article SQL쿼리로 생성됨..
    var articleCount = await db.Article.count();


    //step2: 게시글 전체 목록을 list.ejs뷰에 전달한다.
    res.render('article/list.ejs',{articles,searchOption,articleCount});
});


//게시글 목록에서 조회옵션 데이터를 전달받아 조회옵션기반 게시글 목록 조회후
//게시글 목록 페이지에 대한 요청과 응답처리
//http://localhost:/article/list
//POST
router.post('/list',isLoggedIn,async(req,res)=>{

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
    //SELECT * FROM article WHERE board_type_code = 1 SQL구문으로 변환되어 DB서버에 전달실행
    var articles = await db.Article.findAll({where:{board_type_code:searchOption.boardTypeCode}});

    //Select Count(*) FROM article SQL쿼리로 생성됨..
    var articleCount = await db.Article.count();


    //step3) 게시글 목록 페이지 list.ejs에 데이터 목록을 전달한다.
    res.render('article/list.ejs',{articles,searchOption,articleCount});
});


//신규 게시글 등록 웹페이지 요청 및 응답 라우팅 메소드
//http://localhost:3000/article/create
router.get('/create',isLoggedIn,async(req,res)=>{
    res.render('article/create.ejs');
});


//신규 게시글 사용자 등록정보 처리 요청 및 응답 라우팅메소드
//upload.single('html태그내 file 태그의 name명')
router.post('/create',isLoggedIn,simpleUpload.single('file'),async(req,res)=>{

    //step1: 사용자가 입력한 게시글 등록 데이터 추출
    var boardTypeCode = req.body.boardTypeCode;
    var title = req.body.title;
    var contents = req.body.contents; //hidden 태그에서 사용자 에디터에서 입력한값을 가져옴..
    var articleTypeCode = req.body.articleTypeCode;
    var isDisplayCode = req.body.isDisplayCode;
    var register = req.body.register;


    //step2:추출된 사용자 입력데이터를 단일 게시글 json데이터로 구성해서
    //DB article테이블에 영구적으로 저장처리한다.
    //저장처리후 article테이블에 저장된 데이터 반환됩니다.

    //등록할 게시글 데이터 
    //**중요: 테이블에 저장/수정할 데이터소스는 반드시 데이터모델의 속성명을 이용해야한다.
    //**조심하세요:  article 모델 컬럼에 값이 반드시 들어와야하는값(IS NOT NULL)은 값을 전달해야해요.
    var article ={
        board_type_code:boardTypeCode,
        title,
        contents,
        view_count:0,
        ip_address:"111.222.222.222",
        article_type_code:articleTypeCode,
        is_display_code:isDisplayCode,
        reg_member_id:req.session.passport.user.admin_member_id,
        reg_date:Date.now()
    };

    //게시글 정보를 article테이블에 저장하고 저장된 값을 다시 반환받는다.
    var registedArticle = await db.Article.create(article);
    //var registedArticle = await db.Article.create(article);


    //step1-2:업로드 파일정보 체크하기 
    const uploadFile = req.file;

    //업로드된 파일이 존재하는경우만 데이터 처리 
    if(uploadFile != undefined){
        var filePath ="/upload/"+uploadFile.filename;//서버에 실제 업로드된 물리적 파일명-도메인주소가 생략된 파일링크주소  
        var fileName = uploadFile.filename; //서버에 저장된 실제 물리파일명(파일명/확장자포함)
        var fileOrignalName = uploadFile.originalname;//클라이언트에서 선택한 오리지널파일명명
        var fileSize = uploadFile.size; //파일 크기(KB)
        var fileType=uploadFile.mimetype; //파일포맷
    
    
        var file ={
            article_id:registedArticle.article_id,
            file_name:fileOrignalName,
            file_size:fileSize,
            file_path:filePath,
            file_type:fileType,
            reg_date:Date.now(),
            reg_member_id:req.session.passport.user.admin_member_id
        }
    
        await db.ArticleFile.create(file);
    }


    //step3:등록처리후 게시글 목록 웹페이지로 이동처리 
    res.redirect('/article/list');
});



//신규 게시글 사용자 등록정보 처리 요청 및 응답 라우팅메소드:S3에 파일업로드
//upload.getUpload('upload/').fields([{ name: 'client파일태그명', maxCount: 3 }])
router.post('/creates3',isLoggedIn,upload.getUpload('/').fields([{ name: 'file', maxCount: 1 }]),async(req,res)=>{

    //step1: 사용자가 입력한 게시글 등록 데이터 추출
    var boardTypeCode = req.body.boardTypeCode;
    var title = req.body.title;
    var contents = req.body.contents;
    var articleTypeCode = req.body.articleTypeCode;
    var isDisplayCode = req.body.isDisplayCode;
    var register = req.body.register;


    //step1-2:업로드 파일정보 체크하기 
    const uploadFile = req.files.file[0];
    var filePath ="/upload/"+uploadFile.filename;//서버에 실제 업로드된 물리적 파일명-도메인주소가 생략된 파일링크주소  
    var fileName = uploadFile.filename; //서버에 저장된 실제 물리파일명(파일명/확장자포함)
    var fileOrignalName = uploadFile.originalname;//클라이언트에서 선택한 오리지널파일명명
    var fileSize = uploadFile.size; //파일 크기(KB)
    var fileType=uploadFile.mimetype; //파일포맷



    //step2:추출된 사용자 입력데이터를 단일 게시글 json데이터로 구성해서
    //DB article테이블에 영구적으로 저장처리한다.
    //저장처리후 article테이블에 저장된 데이터 반환됩니다.

    //등록할 게시글 데이터 
    //**중요: 테이블에 저장/수정할 데이터소스는 반드시 데이터모델의 속성명을 이용해야한다.
    //**조심하세요:  article 모델 컬럼에 값이 반드시 들어와야하는값(IS NOT NULL)은 값을 전달해야해요.
    var article ={
        board_type_code:boardTypeCode,
        title,
        contents,
        view_count:0,
        ip_address:"111.222.222.222",
        article_type_code:articleTypeCode,
        is_display_code:isDisplayCode,
        reg_member_id:req.session.passport.user.admin_member_id,
        reg_date:Date.now()
    };

    //게시글 정보를 article테이블에 저장하고 저장된 값을 다시 반환받는다.
    await db.Article.create(article);
    //var registedArticle = await db.Article.create(article);

    //step3:등록처리후 게시글 목록 웹페이지로 이동처리 
    res.redirect('/article/list');
});


//기존 게시를 삭제처리 요청 및 응답 라우팅메소드
//http://localhost:3000/article/delete?aid=3
router.get('/delete',isLoggedIn,async(req,res)=>{

    //step1: 삭제하려는 게시글 고유번호를 추출한다.
    var articleIdx = req.query.aid;

    //step2:게시번호기반으로 실제 DB article테이블에서 데이터를 삭제처리한다.
    var deletedCnt = await db.Article.destroy({where:{article_id:articleIdx}}); 

    //step3: 게시글 목록 페이지로 이동시킨다.
    res.redirect('/article/list');
});



//기존 게시글 정보 확인 및 수정 웹페이지 요청과 응답 라우팅 메소드 
//http://localhost:3000/article/modify/1
//GET
router.get('/modify/:aid',isLoggedIn,async(req,res)=>{
    
    //step1:선택한 게시글 고유번호를 파라메터 방식으로 URL을 통해 전달받음
    var articleIdx = req.params.aid;


    //step2:해당 게시글 번호에 해당하는 특정 단일게시글 정보를 DB article테이블에서 
    //조회해 온다.
    var article = await db.Article.findOne({where:{article_id:articleIdx}});

    //단일 게시글에 동적 속성기반 댓글목록 속성추가 
    article.comments = [{coment_id:1,comment:'댓글1입니다.'},{coment_id:2,comment:'댓글2입니다.'}];


    //step3: 단일 게시글 정보르 뷰에 전달한다.
    res.render('article/modify.ejs',{article});
});


//기존 게시글 사용자 수정정보 처리 요청과 응답 라우팅 메소드 
//http://localhost:3000/article/modify/1
//POST
router.post('/modify/:aid',isLoggedIn,async(req,res)=>{

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
        var article = {
            board_type_code: boardTypeCode,
            title,
            contents,
            article_type_code:articleTypeCode,
            is_display_code: isDisplayCode,
            ip_address:"111.222.222.222",
            edit_member_id:req.session.passport.user.admin_member_id,
            edit_date:Date.now()
        };

        //DB article테이블의 컬럼내용들 수정처리하고 수정건수 반환받기 
        //await db.Article.update(수정할데이터,조건)는 
        //UPDATE article SET board_type_code=1,title='',contents=''.... WHERE article_id=1; SQL이 생성되어
        //DB서버로 전달되어 수정되고 수정된 건수가 배열로 전달된다. 
        var updatedCount = await db.Article.update(article,{where:{article_id:articleIdx}});
    
    
        //step3:수정처리후 게시글 목록 웹페이지로 이동처리 
        res.redirect('/article/list');

});



module.exports = router;