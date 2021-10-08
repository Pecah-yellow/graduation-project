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

setTimeout( () => {
    frontSocket.send("안녕!");
}, 10000);