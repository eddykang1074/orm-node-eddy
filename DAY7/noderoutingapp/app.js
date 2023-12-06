var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var usersRouter = require('./routes/users');

//STEP1:개발자가 정의한 라우터파일을 참조합니다.
var authRouter = require('./routes/auth');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//index.js 기본 라우터의 기본 주소체계정의 
//localhost:3000/~
app.use('/', indexRouter);

//localhost:3000/users/~
app.use('/users', usersRouter);

//AUTH라우터파일의 기본호출 주소체계 정의
//auth.js라우터의 모든 라우팅메소드는 http://localhost:3000/auth/~
app.use('/auth', authRouter);



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
