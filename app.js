const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

server.listen(3000,() => {
    console.log("Server rodando!")
});

app.use(express.static(__dirname + "/public"));

io.on('connection', (socket) => {
    console.log('a user connected: ' + socket.id);

    socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    });

    socket.on('disconnect', () => {
    console.log('user disconnected: ' + socket.id);
    });
});




