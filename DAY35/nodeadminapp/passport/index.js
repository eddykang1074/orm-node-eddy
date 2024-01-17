//로컬 사용자 인증전략 모듈 참조하기- 직접 사용자 가입 및 로그인 구현
const local = require('./localStrategy');


//해당 모듈에 패스포트 객체가 전달됩니다.
//회원 로그인하는 라우팅 메소드에서 전달되는 패스포트 객체를 전달받아 사용함. 
module.exports = passport => {

  //passport 객체에 로그인 사용자의 세션정보를 세팅하는 함수
  //사용자 로그인 완료후 로그인한 사용자정보를 세션에 담아주는 함수
  passport.serializeUser((user, done) => {
    //로그인한 사용자 세션데이터 정보를 세션영역에 바인딩해주는 역할
    done(null, user);
  });

  //바인딩된 세션 데이터를 조회하는 역할
  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  //로컬 사용자 전략에 패스포트 객체를 전달하여 실제 사용자 로그인 기능을 구현합니다. 
  //아이디/암호 체크하고 세션으로 저장할 데이터를 정의하는 기능제공.
  local(passport);
};
