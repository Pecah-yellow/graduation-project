const frontSocket = io();

//화상통화에 관한 부분
const myFace = document.getElementById("myFace"); //비디오 속성 호출
const muteButton = document.getElementById("mute"); //음소거
const cameraButton = document.getElementById("camera"); //카메라 on/off버튼
const camerasSelect = document.getElementById("cameras"); //카메라 리스트
const call = document.getElementById("call");

call.hidden = true;

let myStream; //마이스트림 지정
let muted = false; // 마이크 켜진채로 시작
let cameraOff = false; //카메라 켜진채로 시작
let roomName;
let myPeerConnection;

async function getCameras() {
  //카메라 얻는 함수
  try {
    const devices = await navigator.mediaDevices.enumerateDevices(); //카메라 리스트
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];

    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId; //카메라의 벨류 = 카메라 디바이스 아이디
      option.innerText = camera.label; //카메라 보여주는 텍스트 = 카메라 라벨
      if (currentCamera.label === camera.label) {
        option.selected = true;
        //현재 사용중인 카메라를 선택창에서 표시
      }
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}
async function getMedia(deviceId) {
  //미디어 얻는 함수
  const initialConstrains = {
    // 초기설정, 디바이스 id 없을때 실행
    audio: true,
    video: { facingMode: "user" }, //전면카메라 기본설정
  };
  const cameraConstrains = {
    //디바이스id가 있을때
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstrains : initialConstrains //디바이스 id 있으면 cameraConstrains 없으면 initialConstrains
    );
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  // track.enabled=true
  // !track.enabled=false
  if (!muted) {
    //마이크 켜진상태
    muteButton.innerText = "음소거 해제";
    muted = true;
  } else {
    //마이크 꺼진상태
    muteButton.innerText = "음소거";
    muted = false;
  }
}

function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  // track.enabled=true
  // !track.enabled=false
  if (cameraOff) {
    //카메라 켜진상태
    cameraButton.innerText = "카메라 끄기";
    cameraOff = false;
  } else {
    //카메라 꺼진상태
    cameraButton.innerText = "카메라 켜기";
    cameraOff = true;
  }
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value);
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
  }
}

muteButton.addEventListener("click", handleMuteClick);
cameraButton.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// 화상통화 방 입장에 관한 부분

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function startCall() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  await startCall();
  frontSocket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

//소켓 부분

frontSocket.on("welcome", async () => {
  const offer = await myPeerConnection.createOffer(); //offer 생성
  myPeerConnection.setLocalDescription(offer);
  console.log("offer를 보냈습니다.");
  frontSocket.emit("offer", offer, roomName); //offer 전달
}); //선순위 브라우저 (peerA)

frontSocket.on("offer", async (offer) => {
  console.log("offer를 받았습니다.");
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  frontSocket.emit("asnwer", answer, roomName);
  console.log("answer를 보냈습니다.");
}); //후순위 브라우저 (peerB)

frontSocket.on("answer", (answer) => {
  console.log("answer를 받았습니다.");
  myPeerConnection.setRemoteDescription(answer);
});

frontSocket.on("ice", (ice) => {
  console.log("candidate 를 받았습니다..");
  myPeerConnection.addIceCandidate(ice);
});

//WEB RTC

function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  }); //커넥션 생성
  myPeerConnection.addEventListener("icecandidate", handleIce); //icecandidate 생성
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
  //커넥션 사이에 디바이스 적용
}

function handleIce(data) {
  console.log("candidate 를 보냈습니다.");
  frontSocket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data) {
  const peerFace = document.getElementById("peerFace");
  peerFace.srcObject = data.stream;
}
