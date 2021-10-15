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

wsServer.on("connection", (backSocket) => {
  backSocket.on("join_room", (roomName) => {
    backSocket.join(roomName);
    backSocket.to(roomName).emit("welcome");
  });
  backSocket.on("offer", (offer, roomName) => {
    backSocket.to(roomName).emit("offer", offer);
  });
  backSocket.on("asnwer", (answer, roomName) => {
    backSocket.to(roomName).emit("answer", answer);
  });
});

const handleListen = () => console.log(`http://localhost:3000 연결`);
httpServer.listen(3000, handleListen);
