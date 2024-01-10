var express = require('express');
var router = express.Router();

var bcrypt = require('bcryptjs');
var AES = require('mysql-aes');
var db = require('../models/index.js');


/* 
-신규회원 가입처리 RESTFul API 라우팅 메소드 
-http://localhost:3000/api/member/entry
*/
router.post('/entry', async(req, res, next)=> {
  var apiResult = {
    code:400,
    data:null,
    msg:""
  };

  try{

    var email = req.body.email;
    var password = req.body.password;
    var name = req.body.name;
    var telephone = req.body.telephone;


    //회원가입 로직추가: 메일주소 중복체크
    var existMember = await db.Member.findOne({where:{email}});

    if(existMember != null){
      
      apiResult.code = 500;
      apiResult.data = null;
      apiResult.msg = "ExistDoubleEmail";

    }else{

      //단방향 암호화 해시 알고리즘 적용 사용자 암호 암호화 적용  
      var encryptedPassword = await bcrypt.hash(password,12);

      var encryptedTelephone = AES.encrypt(telephone, process.env.MYSQL_AES_KEY);

      var member = {
        email,
        member_password:encryptedPassword,
        name,
        profile_img_path:"",
        telephone:encryptedTelephone,
        entry_type_code:1,
        use_state_code:1,
        reg_date:Date.now(),
        reg_member_id:0
      };

      var registedMember = await db.Member.create(member);

      //불필요한 중요 데이터 속성값은 지우고 프론트엔드에 전달 
      registedMember.member_password ="";
      registedMember.telephone = AES.decrypt(registedMember.telephone, process.env.MYSQL_AES_KEY);

      apiResult.code = 200;
      apiResult.data = registedMember;
      apiResult.msg = "Ok";
    }

  }catch(err){
    console.log("서버에러발생-/api/member/entry:",err.message);
    apiResult.code = 500;
    apiResult.data = null;
    apiResult.msg = "Failed";
  }

  res.json(apiResult);
});


/* 
-회원 로그인 처리 RESTFul API 라우팅 메소드 
-http://localhost:3000/api/member/login
*/
router.post('/login', async(req, res, next)=> {
  var apiResult = {
    code:400,
    data:null,
    msg:""
  };

  try{
    var email = req.body.email;
    var password = req.body.password;

    var member = await db.Member.findOne({where:{email:email}});
    var resultMsg = "";

    if(member == null){
      resultMsg="NotExistEmail";
      apiResult.code = 400;
      apiResult.data = null;
      apiResult.msg = resultMsg;
    }else{

      //단방향 암호화 해시 알고리즘 암호 체크  
      var compareResult = await bcrypt.compare(password,member.member_password);

      if(compareResult){
        resultMsg="Ok";

        member.member_password ="";
        member.telephone = AES.decrypt(member.telephone, process.env.MYSQL_AES_KEY);

        apiResult.code = 200;
        apiResult.data = member;
        apiResult.msg = resultMsg;
      }else{
        resultMsg="NotCorrectPassword";

        apiResult.code = 400;
        apiResult.data = null;
        apiResult.msg = resultMsg;
      }
    }
  }catch(err){
    console.log("서버에러발생-/api/member/entry:",err.message);
    apiResult.code = 500;
    apiResult.data = null;
    apiResult.msg = "Failed";
  }
  res.json(apiResult);
});


/* 
-회원 암호 찾기 RESTFul API 라우팅 메소드 
-http://localhost:3000/api/member/find
*/
router.post('/find', async(req, res, next)=> {
  res.json({});
});


module.exports = router;
