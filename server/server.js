const express = require("express");
const app = express();
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
const PORT = process.env.PORT || 8005;

const dotenv = require("dotenv");
const { Socket } = require("dgram");
// config를 통해 dotenv가 .env에 있는 변수를 접근하도록 함.(proess.env에 등록해줌)
dotenv.config();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors : {
        origin : "http://localhost:3000",
        method : ["GET","POST"],
    },
})

io.on("connection",(socket)=>{
    console.log(`User connected : ${socket.id}`);

    socket.on("send_message(toServer)", (data)=>{
        socket.broadcast.emit("receive_message(toClient)", data)
    })

    socket.on("disconnect", ()=>{
        console.log(`User disconnected : ${socket.id}`);
    })
})

module.exports = {
    app,
    server,
}