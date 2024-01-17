const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');

//파일명 기반 파일 확장자 조회함수
function getExtention(fileName) {
  if (fileName == '') return '';
  var arrFileName = fileName.split('.');
  console.log(arrFileName);
  return arrFileName[arrFileName.length - 1];
}


//AWS S3 업로드 객체 
const upload = {
  getUpload: function (path) {

    //해당 S3버킷안에 폴더 위치 지정
    var s3path = 'contents/';

    if (path != '') s3path = path;

    //s3객체를 생성시 버킷의 액세스키와 시크리트 키를 전달한다.
    const s3 = new AWS.S3({
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_ACCESS_SECRET_KEY,
    });


    //multerS3 s3전용 멀터 패키지를 이용해 파일 저장처리 
    const storage = multerS3({
      s3: s3,
      bucket: process.env.S3_BUCKET,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata: function (req, file, cb) {
        var ext = getExtention(file.originalname);

        cb(null, {
          fieldName: file.fieldname,
          fileNewName: Date.now().toString() + '.' + ext,  
          extention: '.' + ext,
        });
      },
      key: function (req, file, cb) {
        cb(
          null,
          `uploads/test/${Date.now()}.${getExtention(file.originalname)}`, //S3저장될 파일명형식지정하기 /uploads/contents/...
        );
      },
    });

    return multer({ storage: storage });
  },
};

exports.upload = upload;
