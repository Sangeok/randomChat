const express = require("express");
const app = express();
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
const PORT = process.env.PORT || 8005;

const Queue = require('./Queue');
const dotenv = require("dotenv");
const { Socket } = require("dgram");
// config를 통해 dotenv가 .env에 있는 변수를 접근하도록 함.(proess.env에 등록해줌)
dotenv.config();

app.use(cors());

const readyRoom = new Queue();
const server = http.createServer(app);

const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const readyRoomNumber = [];

const io = new Server(server, {
    cors : {
        origin : "http://localhost:3000",
        method : ["GET","POST"],
    },
})

io.on("connection",(socket)=>{
    // socket에서 사용자가 채팅 시작 버튼을 눌렀는지 여부를 인지하고
    // 채팅 시작 버튼을 눌렀다면 ~
    // 누르지 않았다면 ~
    console.log(`User connected : ${socket.id}`);

    // 사용자가 채팅 시작을 눌렀을 때
    socket.on("startChat", (start)=>{
        console.log(`${socket.id} is starting for chatting.`);
        console.log(`start : ${start}`);
        if(start) {
            console.log(`대기 중인 접속 자 수 : ${readyRoom.size()} 명 입니다.`);
            // 지금 채팅 시작을 누른 사용자가 없다면
            if(readyRoom.size() === 0) {
                // 만약 룸 방 번호를 생성했는데 그것이 배열에 존재하면 다시 번호를 생성.
                let roomId = getRandomNumber(1,1000);
                console.log(roomId);
                while(readyRoomNumber.includes(roomId)) {
                    roomId = getRandomNumber(1,1000);
                }
                readyRoomNumber.push(roomId);
                console.log(`당신이 대기할 방은 ${roomId} 입니다.`);
                readyRoom.enqueue(roomId);

                // 사용자에게 대기할 것을 알리는 것도 필요할듯
                socket.join(roomId);
                // 해당 socket의 roomId를 적음.
                socket.roomId = roomId;
                console.log(`${socket.id}님이 ${socket.roomId}에 입장하셨습니다.`)
                console.log("readyRoomNumber 대기 방 size : " + readyRoomNumber.length);
            }
            // 현재 채팅을 대기중인 사용자가 있다면
            else {
                let roomId = readyRoom.dequeue();
                // console.log("타입2 " + typeof(roomId));
                console.log(`입장할 roomId : ${roomId}`);
                socket.join(roomId);

                // 이게 되나? 논리적으로 되긴하는데 흠
                socket.roomId = roomId;
                console.log(`${socket.id}님이 ${socket.roomId}에 입장하셨습니다.`)
                
                // 매칭된 방은 readyRoomNumber에서 삭제.
                let indexToDelete = readyRoomNumber.indexOf(roomId);
                if(indexToDelete !== -1) readyRoomNumber.splice(indexToDelete, 1)
                console.log("readyRoomNumber 대기 방 size : " + readyRoomNumber.length);
            }
        }
    })

    // 채팅 종료를 눌렀을 때,
    socket.on("leaveChat", (end)=>{
        if(end && socket.roomId) {
            socket.leave(socket.roomId);
            socket.roomId = undefined;
            console.log(`${socket.id}님이 ${socket.roomId}에서 나가셨습니다.`);
        }
    });


    // 사용자가 data를 server 보냈을 때
    socket.on("send_message(toServer)", (data)=>{
        // console.log("타입3 " + typeof(socket.roomId));
        console.log(`${socket.id}님이 채팅방 ${socket.roomId}에 ${data.message}를 보내셨습니다.`)
        socket.to(socket.roomId).emit("receive_message(toClient)", data)
    })

    // 사용자 접속 종료 시
    socket.on("disconnect", ()=>{
        console.log(`User disconnected : ${socket.id}`);
    })
})

module.exports = {
    app,
    server,
}