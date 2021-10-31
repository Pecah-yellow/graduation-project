const frontSocket = io();

//화상통화에 관한 부분
const myFace = document.getElementById("myFace"); //비디오 속성 호출
const muteButton = document.getElementById("mute"); //음소거
const cameraButton = document.getElementById("camera"); //카메라 on/off버튼
const camerasSelect = document.getElementById("cameras"); //카메라 종류 리스트

let myStream; //마이스트림 지정
let muted = false; // 마이크 켜진채로 시작
let cameraOff = false; //카메라 켜진채로 시작
let roomName;
let myPeerConnection;

async function getCameras() {
  //카메라 리스트를 얻어서 변경하게 해주는 함수
  try {
    const devices = await navigator.mediaDevices.enumerateDevices(); //카메라 리스트
    const cameras = devices.filter((device) => device.kind === "videoinput");
    // 필터를 이용해서 카메라만 골라줌
    const currentCamera = myStream.getVideoTracks()[0]; //현재 사용중인 카메라는 0번 카메라로

    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId; //옵션태그의 디바이스 = 카메라 디바이스 아이디
      option.innerText = camera.label; //카메라 보여주는 텍스트 = 카메라 라벨
      if (currentCamera.label === camera.label) {
        option.selected = true;
        //현재 사용중인 카메라를 선택창에서 표시
      }
      camerasSelect.appendChild(option);
      //camerasSelect 안에 option태그 생성
    });
  } catch (error) {
    console.log(error);
  }
}

async function getMedia(deviceId) {
  //비디오 화면, 오디오를 가져오는 함수
  const initialConstrains = {
    // 초기설정, 디바이스 id 없을때 실행
    //휴대폰에서 전면카메라 기본설정
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstrains = {
    //디바이스id가 있을때
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstrains : initialConstrains
      //디바이스 id 있으면 cameraConstrains 없으면 initialConstrains
    );
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    } //카메라 선택이 증식하는것을 막아줌
  } catch (error) {
    console.log(error);
  }
}

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  // track.enabled=true => !track.enabled=false
  // track.enabled=false => !track.enabled=true
  if (muted) {
    //마이크 켜진상태
    muteButton.innerText = "음소거";
    muted = false;
  } else {
    //마이크 꺼진상태
    muteButton.innerText = "음소거 해제";
    muted = true;
  }
}

function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  console.log(myStream.getVideoTracks());
  // track.enabled=true => !track.enabled=false
  // track.enabled=false => !track.enabled=true
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
    //내 카메라는 0번 카메라
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    //video 속성을 가진 sender를 찾아냄
    videoSender.replaceTrack(videoTrack);
    //바뀐 카메라로 전환해줌
  }
}

muteButton.addEventListener("click", handleMuteClick);
cameraButton.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// 화상통화 방 입장에 관한 부분

const call = document.getElementById("call");
call.hidden = true;

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
  //미디어를 생성한 이후에 방 이름을 전달해주기 위함
  frontSocket.emit("join_room", input.value);
  //이벤트 = join_room
  roomName = input.value;
  input.value = "";
  alert(`현재 입장하신 채팅방은 ${roomName} 입니다.`);
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
}); //선순위 브라우저 (peerA)

frontSocket.on("ice", (ice) => {
  console.log("candidate 를 받았습니다.");
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
          //다른 와이파이 환경에서도 접속 가능하게만듬
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
