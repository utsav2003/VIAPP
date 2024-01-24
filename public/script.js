//put video in ejs video grid
// const io = require("socket.io-client");
// // or with import syntax

const socket = io("/");

const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3000",
});

//promise of getting the video
let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: false,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    //answer the call of new user
    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectNewUser(userId, stream);
    });
  });

peer.on("open", (id) => {
  //console.log(id);
  //function call defined in server.js of socket.io
  console.log("new user trying to connect");
  socket.emit("join-room", ROOM_ID, id);
});

//stream parameter coming from socket on userid connectNewUser call
//stream is declared in promise
const connectNewUser = (userId, stream) => {
  //if new user wants to join than make a call and connect its video
  console.log("New user connected");
  const call = peer.call(userId, stream);

  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  //put video in ejs video grid
  videoGrid.append(video);
};

let text = $("input");

var senduname = "";
socket.on("getname", (name) => {
  senduname = name;
  console.log(name);
  console.log("calling");
});

$("html").keydown((e) => {
  if (e.which == 13 && text.val().length !== 0) {
    console.log(text.val());
    mes = text.val();
    console.log(mes);
    array = [mes, senduname];
    socket.emit("message", array);
    text.val("");
  }
});

socket.on("createMessage", (message) => {
  const mes = message[0];
  const name = message[1];

  $("ul").append(`<li class="message"><b>${name}</b><br/>${mes}</li>`);
  scrollToBottom();
});

const scrollToBottom = () => {
  var d = $(".main_chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

// muteunmute button

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;

  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

//video on off

const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setStopVideo = () => {
  const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `;
  document.querySelector(".main__video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `;
  document.querySelector(".main__video_button").innerHTML = html;
};

//share-screen-logic

//   const videoElem = document.getElementById("share-screen-video");
// const logElem = document.getElementById("log");
const startElem = document.getElementById("start");
const stopElem = document.getElementById("stop");

// Options for getDisplayMedia()

var displayMediaOptions = {
  video: {
    cursor: "always",
  },
  audio: false,
};

// Set event listeners for the start and stop buttons
startElem.addEventListener(
  "click",
  function (evt) {
    startCapture();
  },
  false
);

stopElem.addEventListener(
  "click",
  function (evt) {
    stopCapture();
  },
  false
);

// console.log = msg => logElem.innerHTML += `${msg}<br>`;
// console.error = msg => logElem.innerHTML += `<span class="error">${msg}</span><br>`;
// console.warn = msg => logElem.innerHTML += `<span class="warn">${msg}<span><br>`;
// console.info = msg => logElem.innerHTML += `<span class="info">${msg}</span><br>`;

async function startCapture() {
  // logElem.innerHTML = "";

  try {
    const screenData = await navigator.mediaDevices.getDisplayMedia(
      displayMediaOptions
    );
    // videoElem.srcObject= screenData
    // console.log(screenData);
    const video = document.createElement("video");
    video.controls = true;
    video.id = "share-screen";
    video.srcObject = screenData;

    var b = new Buffer(screenData, "utf8");
    // console.log(screenData);

    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    videoGrid.append(video);

    socket.emit("screen-share", b);
    // dumpOptionsInfo();

    // var data = screenData.getVideoTracks()[0];
    // console.log("data",data);
  } catch (err) {
    console.error("Error: " + err);
  }
}

socket.on("addScreen", (screenData) => {
  // const video = document.createElement('video');
  // video.srcObject=screenData
  //   const video = document.createElement('video')
  //   video.controls= true
  //   video.id="share-screen"
  //   video.srcObject= screend

  //   console.log("data",screend);

  //   video.addEventListener('loadedmetadata',()=>{
  //     video.play();
  // })
  // videoGrid.append(video);

  console.log(screenData);
});

//put video in ejs video grid

// }
function stopCapture(evt) {
  console.log("stop is calling");
  remove = document.getElementById("share-screen");
  let tracks = remove.srcObject.getTracks();

  tracks.forEach((track) => track.stop());
  remove.srcObject = null;

  remove.remove();
}

function dumpOptionsInfo() {
  const videoTrack = videoElem.srcObject.getVideoTracks()[0];

  console.info("Track settings:");
  console.info(JSON.stringify(videoTrack.getSettings(), null, 2));
  console.info("Track constraints:");
  console.info(JSON.stringify(videoTrack.getConstraints(), null, 2));
}
