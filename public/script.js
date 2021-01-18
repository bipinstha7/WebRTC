const socket = io("/");
const videoGrid = document.getElementById("video-grid");

/**
 * Peerjs doc:
 *
 * If you DON'T specify 'host' and 'key' options,
 * you will automatically connect to PeerServer Cloud service.
 * Please be aware that you will be sharing it with other people
 * and IDs may collide if you set them manually.
 */
const conn = new Peer();

conn.on("open", id => {
  socket.emit("join-room", ROOM_ID, id);
});

const myVideo = document.createElement("video");
myVideo.muted = true;

const peers = {};
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then(stream => {
    addVideoStream(myVideo, stream);

    conn.on("call", call => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", userVideoStream => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("New user joined", userId => {
      connectToNewUser(userId, stream);
    });
  })
  .catch(err => console.log({ err }));

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });

  videoGrid.append(video);
}

function connectToNewUser(userId, stream) {
  const call = conn.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", userVideoStream => {
    addVideoStream(video, userVideoStream);
  });

  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}

socket.on("user-disconnected", userId => {
  console.log({ uuuuuuuuuuuuu: userId });
  if (peers[userId]) {
    console.log({ userId });
    peers[userId].close();
  }
});
