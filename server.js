const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuid } = require("uuid");

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (_, res) => {
  res.redirect(`/${uuid()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", socket => {
  console.log("connection stablished");
  socket.on("join-room", (roomId, userId) => {
    console.log({ roomId, userId });
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("New user joined", userId);

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
});

server.listen(4040, () => {
  console.log("server started");
});
