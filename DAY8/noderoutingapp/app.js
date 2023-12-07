var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

//개발자정의 상품정보 관리 전용 RESTful API 라우팅 파일참조
var productAPIRouter = require('./routes/productAPI');

//상품 웹페이지에 대한 요청응답처리 전용 라우터 파일 참조 
var productRouter = require('./routes/product');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


//productAPIRouter의 기본주소를 /api/product으로 설정해준다.
//모든 RESTAPI 라우터의 최상위 기본주소는 되도록 /api/~로 시작되게해주면 좋앙용..
app.use('/api/product', productAPIRouter);

//일반상품 웹페이지 요청처리응답 라우팅 기본주소체계 설정 
app.use('/product', productRouter);



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

module.exports = app;
