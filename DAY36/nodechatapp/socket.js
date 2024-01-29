const SocketIO = require("socket.io");

const moment = require('moment');
const jwt = require('jsonwebtoken');

//socket.io-redis참조
var redis = require("socket.io-redis");


//DB객체 참조하기 
var db = require('./models/index');


module.exports =(server)=>{

    const io = SocketIO(server, {
        path: "/socket.io",
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });


    //Redis Backplain 연결설정
    //env파일에 넣어서 관리하세요..
    io.adapter(
        redis({
            host:process.env.REDIS_HOST,
            port:process.env.REDIS_PORT
        })
    );



    io.on("connection",async(socket)=>{

        //소켓Req객체
        const req = socket.request;


        //현재 연결되는 사용자들 기반을 사용할 전역변수 정의 사용
        const socketId = socket.id; //현재 연결 사용자의 고유한 ConnectionId값 조회
       
        //접속 클라이언트 IP주소
        const userIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;//사용자IP


        //시스템 소켓 이벤트 재 정의하기

        //웹브라우저와 서버소켓이 끊어질떄마다 자동으로 발생하는 이벤트
        //사용자가 채팅중에 웹브라우저를 닫거나/탭을 닫거나 일시적 네트워크 장애가 발생해 웹소켓이 끊기는경우
        //서버소켓에서 자동 소켓 끊김 감지 기능제공
        socket.on('disconnect',async()=>{

            //개발자 정의 현재 접속자 연결 끊김 처리함수 
            await UserConnectionOut();

            // 소켓 끊김시 서버측 자원정리 기능제공
            clearInterval(socket.interval);
        }); 

        //소켓통신 에러 감지 이벤트 핸들러
        socket.on('error',async(error)=>{
            console.log("서버 소켓 에러발생 이벤트 감지기....");
        }); 



        socket.on("broadcast",async(msg)=>{
            io.emit("receiveAll",msg);
        });



        socket.on("test",async(nickName,msg)=>{
            var sendDate = moment(Date.now()).format('YYYY-MM-DD hhMMss');
            io.emit("receiveTest",nickName,msg,sendDate);
        });

        socket.on("entry",async(channelId,nickName)=>{
            socket.join(channelId);
            socket.emit("entryok",`${nickName} 대화명으로 입장했습니다.`);
            socket.to(channelId).emit("entryok",`${nickName}님이 채팅방에 입장했습니다`);
        });

        socket.on("groupmsg",async(msgData)=>{
            var sendMsg = `${msgData.nickName}:${msgData.message}`;
            io.to(msgData.channelId).emit("receiveGroupMsg",sendMsg);
        });


        //채팅방 입장하기 
        socket.on('entryChannel',async(channel)=>{

            try{

                var currentUser = jwt.verify(channel.token,process.env.JWT_SECRET);

                //step1:채널유형별 채널정보 생성 또는 조회하기
                //일대일 채널은 생성하고 그룹 채널은 조회하기 
                var channelData = {}; 

                if(channel.channelType == 1){

                    //일대일 채널의 채널명 생성하기 : 회원번호가 작은게 앞으로 구성된 1-100 과 같은 문자열 생성
                    var channelName = channel.targetMemberId < currentUser.member_id ? `${channel.targetMemberId}-${currentUser.member_id}`
                    :`${currentUser.member_id}-${channel.targetMemberId}`;

                    //일대일 채널 존재여부 체크 후 없으면 생성
                    channelData = await db.Channel.findOne({
                        where:{channel_name:channelName,category_code:1}
                    });

                    //동일한 일대일 채널정보가 존재하지 않으면 일대일 채널 생성하기  
                    if(channelData == null){
                        var channelInfo = {
                            community_id:1,
                            category_code:channel.channelType,
                            channel_name:channelName,
                            channel_img_path:"",
                            user_limit:2,
                            channel_state_code:1,
                            reg_date:Date.now(),
                            reg_member_id:currentUser.member_id
                        }
                        //신규 일대일 채널 생성
                        var registedChannel = await db.Channel.create(channelInfo);
                        
                        channelData = registedChannel;

                        //일대일 채널 구성원 정보 등록
                        var currentMember = {
                            channel_id:registedChannel.channel_id,
                            member_id:currentUser.member_id,
                            nick_name:currentUser.name,
                            member_type_code:1,
                            active_state_code:0,
                            connection_id:"",
                            ip_address:"",
                            edit_date:Date.now(),
                            edit_member_id:currentUser.member_id
                        };

                        await db.ChannelMember.create(currentMember);


                        var targetMember = {
                            channel_id:registedChannel.channel_id,
                            member_id:channel.targetMemberId,
                            nick_name:channel.targetNickName,
                            member_type_code:0,
                            active_state_code:0,
                            connection_id:"",
                            ip_address:"",
                            edit_date:Date.now(),
                            edit_member_id:currentUser.member_id
                        }
                        await db.ChannelMember.create(targetMember);
                    }

                }else{
                    //그룹채널 정보조회 
                    //전달된 채널 고유번호로 조회해서 channelData에 할당하면 됩니다.
                }

                //step2: 현재 채팅방 접속자 정보 조회 및 정보 업데이트 
                //현재 접속자의 접속상태 와 접속일시 정보 업데이트 처리 
                var updateMember = {
                    active_state_code:1,
                    last_contact_date:Date.now(),
                    connection_id:socketId,
                    ip_address:userIP
                };

                await db.ChannelMember.update(updateMember,{
                    where:{channel_id:channelData.channel_id,member_id:currentUser.member_id}
                });

                //step3: 채널 조인(채팅방입장처리하기)
                socket.join(channelData.channel_id);

                //step4: 채널 조인결과 메시지 발송 
                //현재 접속자에게 메시지발송하기 
                socket.emit("entryok",`${currentUser.name} 대화명으로 입장했습니다.`,currentUser.name,channelData);

                //채팅방에 나를 제외한 모든 채팅방 사용자에게 입장사실 메시지 알림
                socket.to(channelData.channel_id).emit("entryok",`${currentUser.name}님이 채팅방에 입장했습니다`,currentUser.name,channelData);

                //채팅방 입장 로그 기록 하기 
                await ChattingMsgLogging(channelData.channel_id,currentUser.member_id,currentUser.name,1,`${currentUser.name}님이 채팅방에 입장했습니다`);


            }catch(err){
                console.log("채널 입장에러 발생:",err);

                //현재 사용자에게 서버에러로 채널 입장 실패메시지 보내기 
                socket.emit("entryok",`채널 접속오류가 발생했습니다.`);
            }

        });


        //채팅방별 메시지 수발신 처리 
        socket.on("channelMsg",async(channelId,memberId,nickName,profile,message)=>{
            var sendDate = moment(Date.now()).format('HH:mm');

            //해당 채널의 모든 사용자들에게 메시지 발송하기 
            io.to(channelId).emit("receiveChannelMsg",nickName,profile,message,sendDate);

            //채팅 이력 로그 기록 하기 
            await ChattingMsgLogging(channelId,memberId,nickName,2,message);
        });



        //채팅 이력 정보 기록처리 함수 
        async function ChattingMsgLogging(channelId,memberId,nickName,msgTypeCode,msg){
            var msg ={
                channel_id:channelId,
                member_id:memberId,
                nick_name:nickName,
                msg_type_code:msgTypeCode,
                connection_id:socketId,
                ip_address:userIP,
                message:msg,
                msg_state_code:1,
                msg_date:Date.now(),
            }

            await db.ChannelMsg.create(msg);
        }


        //사용자 나가기 정보 처리 
        async function UserConnectionOut(){
            //현재 접속이 끊어지는 사용자의 Connectionid기반으로 현재 사용자 정보조회 

            var member = await db.ChannelMember.findOne({where:{connection_id:socketId}});

            if(member != null){

                //사용자 연결 끊김 정보 수정반영하기 
                var updateMember = {
                    active_state_code:0,
                    last_out_date:Date.now(),
                    connection_id:socketId,
                    ip_address:userIP
                };

                await db.ChannelMember.update(updateMember,{
                    where:{connection_id:socketId}
                });


                //채팅방 퇴장 로그 기록 하기 
                await ChattingMsgLogging(member.channel_id,member.member_id,member.nick_name,0,`${member.nick_name}님이 채팅방을 퇴장했습니다`);

            }
        }








    });
}


