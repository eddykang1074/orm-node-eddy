const mongoose = require('mongoose');

const connect = () => {
if (process.env.NODE_ENV !== 'production') {
    //현재 소스 실행환경이 개발환경인 경우 디버깅 가능하게 설정한다.
    mongoose.set('debug', true);
}


//몽고DB연결정보를 설정합니다.
mongoose.connect('mongodb://eddy:eddy524640!@127.0.0.1:27017/admin', {
    dbName: 'modu_chat',
}, (error) => {
if (error) {
    console.log('몽고디비 연결 에러', error);
} else {
    console.log('몽고디비 연결 성공');
}
});
};



mongoose.connection.on('error', (error) => {
    console.error('몽고디비 연결 에러', error);
});


mongoose.connection.on('disconnected', () => {
    console.error('몽고디비 연결이 끊겼습니다. 연결을 재시도합니다.');
    connect();
});


//회원정보 콜렉션 모델을 참조합니다.
//require('./member.js');


//게시글 ODM모델 추가
require('./article.js');


module.exports = connect;