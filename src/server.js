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

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (backSocket) => {
  backSocket["nickname"] = "익명";

  backSocket.onAny((event) => {
    console.log(`Socket Event : ${event}`);
  });

  backSocket.on("enter_room", (roomName, showRoom) => {
    backSocket.join(roomName);
    showRoom();
    backSocket
      .to(roomName)
      .emit("welcome", backSocket.nickname, countRoom(roomName));
    wsServer.sockets.emit("room_change", publicRooms());
  });

  backSocket.on("disconnecting", () => {
    backSocket.rooms.forEach((room) =>
      backSocket.to(room).emit("bye", backSocket.nickname, countRoom(room) - 1)
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

const handleListen = () => console.log(`http://localhost:3000 연결`);
httpServer.listen(3000, handleListen);
