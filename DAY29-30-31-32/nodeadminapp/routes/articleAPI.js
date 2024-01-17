
//게시글 데이터 관리 전용 RESTful API 라우터 파일
//기본 라우터 호출주소 : http://localhost:3000/api/article/~

var express = require('express');
var router = express.Router();

var moment = require('moment');

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




//전체 게시글 목록 데이터 조회 반환 API 라우팅 메소드 
//http://localhost:3000/api/article/all
router.get('/all',async(req,res)=>{

    //API라우팅 메소드 반환형식 정의 
    var apiResult = {
        code:200,
        data:[],
        result:"Ok"
    };

    //예외처리 구문....
    try{
        //try블록안에 에러가 발생할수 있는 각종 개발자 코드 구현...

        //step1: DB에서 전체 게시글 목록 데이터를 조회한다.
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

        //프론트엔드로 반환할 실제데이터 바인딩
        apiResult.code = 200;
        apiResult.data = articles;
        apiResult.result = "Ok";

    }catch(err){
        //console.log(err.message);
        //서버측 에러코드는 프론트엔드나 사용자에게 직접 정보를 제공하지 않고 대표 메시지를 안내한다.
        //서버측 에러코는는 추후 별도 로깅시스템 구현을 통해 서버에 특정폴더내에 로그파일로 기록하거나
        //백엔드 에러발생 알림 시스템(sms,email등등)을 통해 실시간 에러정보를 노티해준다.
        apiResult.code = 500;
        apiResult.data = null;
        apiResult.result = "Failed"
    }


    res.json(apiResult);
});


//신규 게시글 등록처리 API  라우팅 메소드 
//http://localhost:3000/api/article/create
router.post('/create',async(req,res)=>{

    //API라우팅 메소드 반환형식 정의 
    var apiResult = {
        code:200,
        data:[],
        result:"Ok"
    };

    try{

        //step1: 프론트엔드에서 전달해준 신규 게시글 JSON데이터 추출하기 
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

        //step2:DB article 테이블에 데이터를 등록하고 등록된 데이터가 반환된다.
        var savedArticle = {
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

        //step3: 정상 데이터 등록처리 결과값 세팅하기 
        apiResult.code = 200;
        apiResult.data = savedArticle;
        apiResult.result = "Ok"


    }catch(err){
        apiResult.code = 500;
        apiResult.data = null;
        apiResult.result = "Failed"
    }


    res.json(apiResult);
});


//단일 게시글 수정처리 API  라우팅 메소드 
//http://localhost:3000/api/article/update
router.post('/update',async(req,res)=>{

    //API라우팅 메소드 반환형식 정의 
    var apiResult = {
        code:200,
        data:[],
        result:"Ok"
    };

    try{

     //step1: 사용자가 수정한 게시글 수정 데이터 추출
     var articleIdx = req.body.articleIdx;

     var boardTypeCode = req.body.boardTypeCode;
     var title = req.body.title;
     var contents = req.body.contents;
     var articleTypeCode = req.body.articleTypeCode;
     var isDisplayCode = req.body.isDisplayCode;
     var register = req.body.register;
 
     //step2:추출된 사용자 수정데이터를 단일 게시글 json데이터로 구성해서
     //DB article테이블에  수정 처리 반영한다.
     //수정처리후 적용건수 반환됨..
 
     //수정할 게시글 데이터 
     var article ={
        articleIdx,
         boardTypeCode,
         title,
         contents,
         articleTypeCode,
         isDisplayCode,
         register,
         registDate:Date.now()
     };


     //step2: 수정처리후 처리건수가 반환됨
     //db수정처리함 처리후 적용건수 1이 반환되었다고 가정함...
     var affectedCnt = 1;


     //step3: 정상 수정된 정보를 apiResult객체 바인딩함
     apiResult.code = 200;
     apiResult.data = affectedCnt;
     apiResult.result = "Ok"

    }catch(err){
        apiResult.code = 500;
        apiResult.data = 0;
        apiResult.result = "Failed"
    }

    res.json(apiResult);
});



//단일 파일업로드 처리 RESTful API 라우팅메소드
//게시글 파일 업로드 전용 RESTful API 라우팅 메소드
//http://localhost:3000/api/article/upload
router.post('/upload',simpleUpload.single('file'),async(req,res)=>{
    
    //API라우팅 메소드 반환형식 정의 
    var apiResult = {
        code:200,
        data:null,
        result:""
    };

    try{

        const uploadFile = req.file;
        var filePath ="/upload/"+uploadFile.filename;//서버에 실제 업로드된 물리적 파일명-도메인주소가 생략된 파일링크주소  
        var fileName = uploadFile.filename; //서버에 저장된 실제 물리파일명(파일명/확장자포함)
        var fileOrignalName = uploadFile.originalname;//클라이언트에서 선택한 오리지널파일명명
        var fileSize = uploadFile.size; //파일 크기(KB)
        var fileType=uploadFile.mimetype; //파일포맷

        apiResult.code = 200;
        apiResult.data = {filePath,fileName,fileOrignalName,fileSize,fileType};
        apiResult.result = "Ok";

    }catch(err){
        apiResult.code = 500;
        apiResult.data = {};
        apiResult.result = "Failed";
    }

    res.json(apiResult);

});


//단일 파일업로드 처리 RESTful API 라우팅메소드
//게시글 파일 업로드 전용 RESTful API 라우팅 메소드
//http://localhost:3000/api/article/uploadS3
router.post('/uploadS3',upload.getUpload('/').fields([{ name: 'file', maxCount: 1 }]),async(req,res)=>{
    
    //API라우팅 메소드 반환형식 정의 
    var apiResult = {
        code:200,
        data:null,
        result:""
    };

    try{

        const uploadFile = req.files.file[0];
        var filePath ="/upload/"+uploadFile.filename;//서버에 실제 업로드된 물리적 파일명-도메인주소가 생략된 파일링크주소  
        var fileName = uploadFile.filename; //서버에 저장된 실제 물리파일명(파일명/확장자포함)
        var fileOrignalName = uploadFile.originalname;//클라이언트에서 선택한 오리지널파일명명
        var fileSize = uploadFile.size; //파일 크기(KB)
        var fileType=uploadFile.mimetype; //파일포맷

        apiResult.code = 200;
        apiResult.data = {filePath,fileName,fileOrignalName,fileSize,fileType};
        apiResult.result = "Ok";

    }catch(err){
        apiResult.code = 500;
        apiResult.data = {};
        apiResult.result = "Failed";
    }

    res.json(apiResult);

});





//단일 게시글 데이터 조회 반환 API 라우팅 메소드 
//http://localhost:3000/api/article/1
router.get('/:aidx',async(req,res)=>{


    //API라우팅 메소드 반환형식 정의 
    var apiResult = {
        code:200,
        data:[],
        result:"Ok"
    };

    try{

        //step1:url을 통해 전달된 게시글 고유번호를 추출한다.
        var articleIdx = req.params.aidx;

        //step2: 게시글 고유번호에 해당하는 단일 게시글 정보를 DB에서 조회해온다.
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

        //step3: 정상 조회된 정보를 apiResult객체 바인딩함
        apiResult.code = 200;
        apiResult.data = article;
        apiResult.result = "Ok"

    }catch(err){
        apiResult.code = 500;
        apiResult.data = null;
        apiResult.result = "Failed"
    }


    res.json(apiResult);
});


//단일 게시글 삭제처리 API 라우팅 메소드 
//http://localhost:3000/api/article/1
router.delete('/:aidx',async(req,res)=>{

    //API라우팅 메소드 반환형식 정의 
    var apiResult = {
        code:200,
        data:[],
        result:"Ok"
    };

    try{
        
        //step1: url주소에서 게시글 고유번호를 추출한다.
        var articleIdx = req.params.aidx;

        //step2: db의 article테이블에서 해당 게시글 번호글을 완존 삭제처리한다.

        //step3: db에서 삭제된 건수가 전달된다.
        var deletedCnt = 1;

        //step4: 정상 삭제된 정보를 apiResult객체 바인딩함
        apiResult.code = 200;
        apiResult.data = deletedCnt;
        apiResult.result = "Ok"

    }catch(err){
        apiResult.code = 500;
        apiResult.data = 0;
        apiResult.result = "Failed"
    }

    res.json(apiResult);
});



module.exports = router;