const express = require("express");
const app = express();
const http = require("http");
const { cpuUsage } = require("process");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

server.listen(3000,() => {
    console.log("Server rodando!")
});

app.use(express.static(__dirname));

let playersOn = []
let roadYValues;

// - check if it is the first player connected to the game
// - so request the road values from it just to test

//server handling connections 
io.on('connection', (socket) => {

    let wasEmpty = playersOn.length <= 0;

    //log the user id connecting
    console.log('Player connected: ' + socket.id);
    
    playersOn.push(socket);
    console.log('Players active: ' + playersOn.length);
    

    if(wasEmpty && playersOn.length === 1){
        socket.emit("client-requested-game-data",socket.id, "Oi");
    }
    else
        socket.emit("client-populate-road",roadYValues);

    socket.on("send-game-data",(roadValues)=>{
        roadYValues = roadValues;
    });

    socket.on('player-input', (msg) => {
        messagesHistory.push(msg);
        //broadicasting the message to everyone
        io.emit('client-player-input',msg);
    });

    //log the user id disconnecting
    socket.on('disconnect', () => {
        console.log('Player disconnected: ' + socket.id);
        playersOn.splice(playersOn.indexOf(socket),1);
        console.log('Players remaining: ' + playersOn.length);
    });
});





