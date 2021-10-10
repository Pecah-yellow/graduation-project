import http from "http";
import WebSocket from "ws";
import express from"express";
import { Socket } from 'dgram';

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`http://localhost:3000 연결`);
 
const server = http.createServer(app);
const wss = new WebSocket.Server( {server} ); //websocket 서버 생성

const backSockets = [];

wss.on("connection", (backSocket) => {
    backSockets.push(backSocket);

    console.log("브라우저와 연결되었습니다.✔");

    backSocket.on("close",() => console.log("브라우저와 연결이 해제되었습니다.❌"))
   
    backSocket.on("message", (message)=> {
        backSockets.forEach((anotherSocket) => anotherSocket.send(message.toString()))
    });
});

server.listen(3000, handleListen);