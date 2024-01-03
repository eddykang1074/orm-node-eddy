
//mongoose 패키지를 참조한다.
const mongoose = require('mongoose');


//숫자 자동채번 기능제공을 위한 mongoose-sequence 패키지 설치하고 참조하기 
//npm i mongoose-sequence@5.3.1
//mongoose-sequence 기능을 이용하면 MongoDB에 counters콜렉션이 자동생성되고 자동채번번호를 관리해줍니다. 
const AutoIncrement = require("mongoose-sequence")(mongoose);
const { Schema } = mongoose;

//Schema클래스를 생성할때 생성자함수에 새로만들 콜렉션의 스키마(데이터구조)를 정의합니다.
const articleSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    article_type_code: {
        type: Number,
        required: true,
    },
    contents: {
        type: String,
        required: false,
    },
    view_count: {
        type: Number,
        required: true,
    },
    is_display_code: {
        type: Number,
        required: true,
    },
    ip_address: {
        type: String,
        required: false,
    },
    edit_date: {
        type: Date,
        default: Date.now,
    },
    edit_member_id: {
        type: Number,
        required: false,
    },
});


//자동채번 컬럼생성 및 콜렉션에 추가 
articleSchema.plugin(AutoIncrement, { inc_field: "article_id" }); //article_id는 1,2,3,4..


//mongoose.model('콜렉션이름',콜렉션 구조정의클래스)호출해서 물리적인 콜랙션(테이블)을 생성해줍니다.
module.exports = mongoose.model('Article', articleSchema);