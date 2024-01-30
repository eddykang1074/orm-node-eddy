var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//환경설정파일 호출하기: 전역정보로 설정됩니다.
//호출위치는 반드시 app.js내 최상위에서 호출할것..
require('dotenv').config();



//웹소켓 모듈추가
const webSocket = require('./socket');

//CORS 접근 이슈 해결을 위한 cors패키지 참조 
const cors = require("cors");

var sequelize = require('./models/index.js').sequelize;


var expressLayouts = require('express-ejs-layouts');


//웹페이지 요청과 응답처리 전용 라우터파일 참조
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var channelRouter = require('./routes/channel');


//RESTFul 데이터 요청과 응답처리 전용 라우터파일 참조 
var memberAPIRouter = require('./routes/memberAPI.js');
var channelAPIRouter = require('./routes/channelAPI.js');

var app = express();

//mysql과 자동연결처리 및 모델기반 물리 테이블 생성처리제공
sequelize.sync(); 


//모든 RESTFUL호출에 대한 응답 허락하기-CORS ALL허락..
//app.use(cors());

//특정 도메인주소만 허락
app.use(
  cors({
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    origin: ["http://localhost:3005","https://naver.com"],
  })
);




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


//레이아웃 설정
app.set('layout','authLayout');
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);
app.set("layout extractMetas", true);
app.use(expressLayouts);




app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/chat', channelRouter);

app.use('/api/member', memberAPIRouter);
app.use('/api/channel', channelAPIRouter);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


//노드앱의 기본 WAS 서비스 포트
app.set('port', process.env.PORT || 3000);

//노드앱이 작동되는 서버 객체 생성 
var server = app.listen(app.get('port'),function(){

});


//웹소켓 express서버와 연결처리
//webSocket모듈에 nodeapp이 실행되는 서버객체를 전달합니다.
//socket.io 소켓모듈과 node express앱을 통합해줍니다.
webSocket(server);


server.on('error', onError);
server.on('listening', onListening);


function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
}






