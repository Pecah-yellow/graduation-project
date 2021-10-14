const frontSocket = io();

const myFace = document.getElementById("myFace"); //비디오 속성 호출
const muteButton = document.getElementById("mute"); //음소거
const cameraButton = document.getElementById("camera"); //카메라 on/off버튼
const camerasSelect = document.getElementById("cameras"); //카메라 리스트
let myStream; //마이스트림 지정
let muted = false; // 마이크 켜진채로 시작
let cameraOff = false; //카메라 켜진채로 시작

async function getCameras() {
  //카메라 얻는 함수
  try {
    const devices = await navigator.mediaDevices.enumerateDevices(); //카메라 리스트
    const cameras = devices.filter((device) => device.kind === "videoinput");

    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId; //카메라의 벨류 = 카메라 디바이스 아이디
      option.innerText = camera.label; //카메라 보여주는 텍스트 = 카메라 라벨
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}
async function getMedia() {
  //미디어 얻는 함수
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    myFace.srcObject = myStream;
    await getCameras();
  } catch (e) {
    console.log(e);
  }
}

getMedia();

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
muteButton.addEventListener("click", handleMuteClick);
cameraButton.addEventListener("click", handleCameraClick);
