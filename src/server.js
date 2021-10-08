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

wss.on("connection", (backSocket) => {
    console.log("브라우저와 연결되었습니다.✔");

    backSocket.on("close",() => console.log("브라우저와 연결이 해제되었습니다.❌"))
   
    backSocket.on("message", (messege)=> {
        console.log(messege.toString('utf-8'));
    });
    backSocket.send("Hello!");
    //console.log(backSocket);
});

server.listen(3000, handleListen);