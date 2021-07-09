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

//server handling connections 
io.on('connection', (socket) => {

    //log the user id connecting
    console.log('a user connected: ' + socket.id);

    //server get the messages from all users here
    socket.on('chat message', (msg) => {
        //broadicasting the message to everyone
        io.emit('client-chat-message',msg);
    });

    //log the user id disconnecting
    socket.on('disconnect', () => {
        console.log('user disconnected: ' + socket.id);
    });
});




