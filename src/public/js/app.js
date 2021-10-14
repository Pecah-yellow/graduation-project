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

frontSocket.on("welcome", (userJoin, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room :  ${roomName} (${newCount})`;
  addMessage(`${userJoin} arrived!`);
});

frontSocket.on("bye", (userLeft, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room :  ${roomName} (${newCount})`;
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
