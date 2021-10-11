const messageList = document.querySelector("ul");
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

