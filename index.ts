import * as express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

const io = new Server(server, { serveClient: false });

// via https://fly.io/blog/always-be-connecting-with-https/
app.use(function (req, res, next) {
  if (req.get("X-Forwarded-Proto") == "http") {
    // request was via http, so redirect to https
    res.redirect("https://" + req.headers.host + req.url);
  } else {
    next();
  }
});
app.use(express.static("public"));

const livetexts = new Map<string, string>();

const dynamicNsp = io.of(/^\/\w+-\w+$/).on("connection", (socket) => {
  const newNamespace = socket.nsp;

  console.log(newNamespace.name);

  socket.emit("notice", { name: newNamespace.name });
  if (livetexts.has(newNamespace.name)) {
    socket.emit("text", livetexts.get(newNamespace.name));
  }

  newNamespace.emit("notice", {
    size: newNamespace.sockets.size,
  });

  socket.on("text", (text) => {
    livetexts.set(newNamespace.name, text);
    // Emit text to all clients except sender
    socket.broadcast.emit("text", text);
  });

  socket.on("disconnect", () => {
    if (newNamespace.sockets.size === 0) {
      livetexts.delete(newNamespace.name);
    }

    newNamespace.emit("notice", {
      size: newNamespace.sockets.size,
    });
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`server started on http://localhost:${PORT}`);
});
