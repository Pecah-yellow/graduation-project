import http from "http";
import SocketIo, { Socket } from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIo(httpServer);

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

wsServer.on("connection", (backSocket) => {
  backSocket["nickname"] = "익명";

  backSocket.onAny((event) => {
    console.log(`Socket Event : ${event}`);
  });

  backSocket.on("enter_room", (roomName, showRoom) => {
    backSocket.join(roomName);
    showRoom();
    backSocket.to(roomName).emit("welcome", backSocket.nickname);
    wsServer.sockets.emit("room_change", publicRooms());
  });

  backSocket.on("disconnecting", () => {
    backSocket.rooms.forEach((room) =>
      backSocket.to(room).emit("bye", backSocket.nickname)
    );
  });
  backSocket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });
  backSocket.on("new_message", (messaage, room, showMessage) => {
    backSocket
      .to(room)
      .emit("new_message", `${backSocket.nickname} : ${messaage}`);
    showMessage();
  });

  backSocket.on("nickname", (nickname) => (backSocket["nickname"] = nickname));
});

/*
const wss = new WebSocket.Server( {server} ); //websocket 서버 생성

const backSockets = [];

wss.on("connection", (backSocket) => {
    backSockets.push(backSocket);

    backSocket["nickname"] = "익명";

    console.log("브라우저와 연결되었습니다.✔");

    backSocket.on("close",() => console.log("브라우저와 연결이 해제되었습니다.❌"))
   
    backSocket.on("message", (msg)=> {
        const message = JSON.parse(msg);
        switch(message.type){
            case "new_message":
                backSockets.forEach((anotherSocket) => anotherSocket.send(`${backSocket.nickname}: ${message.payload}`))
            case "nickname":
                backSocket["nickname"] = message.payload;
        }
    });
});
*/
const handleListen = () => console.log(`http://localhost:3000 연결`);
httpServer.listen(3000, handleListen);
