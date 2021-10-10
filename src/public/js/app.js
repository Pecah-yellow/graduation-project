const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");
const frontSocket = new WebSocket(`ws://${window.location.host}`);

frontSocket.addEventListener("open", () => {
    console.log("서버와 연결되었습니다.✔");
});

frontSocket.addEventListener("message", (message) => {
    console.log("새로운 메세지 : ",message.data);
});

frontSocket.addEventListener("close", ()  => {
    console.log("서버와 연결이 해제되었습니다.❌");
});

function handleSubmit(event){
    event.preventDefault();
    const input = messageForm.querySelector("input");
    frontSocket.send(input.value);
    input.value = "";
}
messageForm.addEventListener("submit", handleSubmit);