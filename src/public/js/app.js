const frontSocket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  frontSocket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

function handelNicknameSubimt(event) {
  event.preventDefault();
  const input = room.querySelector("#name input");
  frontSocket.emit("nickname", input.value);
}
function showRoom() {
  welcome.hidden = true;
  room.hidden = false;

  const h3 = room.querySelector("h3");
  h3.innerText = `Room :  ${roomName}`;
  const msgForm = room.querySelector("#msg");
  const nameForm = room.querySelector("#name");
  msgForm.addEventListener("submit", handleMessageSubmit);
  nameForm.addEventListener("submit", handelNicknameSubimt);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  frontSocket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

frontSocket.on("welcome", (userJoin) => {
  addMessage(`${userJoin} arrived!`);
});

frontSocket.on("bye", (userLeft) => {
  addMessage(`${userLeft} left `);
});

frontSocket.on("new_message", addMessage);

frontSocket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});
/*const messageList = document.querySelector("ul");
const nicknameForm = document.querySelector("#nickname");
const messageForm = document.querySelector("#message");
const frontSocket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload){
    const msg = {type,payload};
    return JSON.stringify(msg);
}
frontSocket.addEventListener("open", () => {
    console.log("서버와 연결되었습니다.✔");
});

frontSocket.addEventListener("message", (message) => {
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
});

frontSocket.addEventListener("close", ()  => {
    console.log("서버와 연결이 해제되었습니다.❌");
});

function handleSubmit(event){
    event.preventDefault();
    const input = messageForm.querySelector("input");
    frontSocket.send(makeMessage("new_message",input.value));
    input.value = "";
}

function handleNickSubmit(event){
    event.preventDefault();
    const input = nicknameForm.querySelector("input");
    frontSocket.send(makeMessage("nickname",input.value));
}

messageForm.addEventListener("submit", handleSubmit);
nicknameForm.addEventListener("submit", handleNickSubmit);
*/
