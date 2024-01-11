const path = require('path');
const Sequelize = require('sequelize');

//개발모드 환경설정
const env = process.env.NODE_ENV || 'development';

//DB연결 환경설정정보 변경처리//관련정보 수정
//const config = require(path.join(__dirname,'..','config','config.json'))[env];

//config.js모듈 파일 기반으로 DB연결정보 가져오기 
const config = require('../config/config.js')[env];


//데이터 베이스 객체
const db= {};

//DB연결정보로 시퀄라이즈 ORM 객체 생성
const sequelize = new Sequelize(config.database,config.username,config.password,config);

//DB 처리 객체에 시퀄라이즈 정보 맵핑처리
//이후 DB객체를 통해 데이터 관리가능해짐
db.sequelize = sequelize; //DB연결정보를 포함한 DB제어 객체속성(CRUD)
db.Sequelize = Sequelize; //Sequelize팩키지에서 제공하는 각종 데이터 타입 및 관련 객체정보를 제공함


//회원모델 모듈파일 참조하고 db속성정의하기
db.Article = require('./article.js')(sequelize,Sequelize);

//게시글 파일정보관리 모델 
db.ArticleFile = require('./articlefile.js')(sequelize,Sequelize);


//관리자계정 정보 모델 추가 
db.Admin = require('./admin.js')(sequelize,Sequelize);


//테블간의 ORM기반 관계설정하기 영역 : 1:N관계를 ORM으로 설정하기 
db.Article.hasMany(db.ArticleFile,{foreignKey: 'article_id', sourceKey:'article_id'});
db.ArticleFile.belongsTo(db.Article,{foreignKey:'article_id',targetKey:'article_id'});


//db객체 외부로 노출하기 
module.exports = db;
