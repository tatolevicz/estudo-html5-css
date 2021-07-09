
const { Noise }  = require("./scripts/server/utils/noise.js")
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

let noise = new Noise(500,160);
noise.populate();

// - check if it is the first player connected to the game
// - so request the road values from it just to test

//server handling connections 
io.on('connection', (socket) => {


    //log the user id connecting
    console.log('Player connected: ' + socket.id);

    //create the intial game on client
    socket.emit("client-create-road",noise.getValues());
    socket.emit("client-create-sky",noise.getValues());
    socket.emit("client-create-player",socket.id);


    //add this player to the connected array
    playersOn.push(socket);
    console.log('Players active: ' + playersOn.length);
    

    socket.on("start-game-pressed",() =>{
        io.emit("client-init-game");
    });
    

    //tell to this player create the others as enemys
    playersOn.forEach(p => {
        socket.emit("client-create-enemy", p.id);
    });

    //now tell everyone connected to create a new enemy
    io.emit("client-create-enemy",socket.id);

    // socket.on('player-input', (msg) => {
    //     messagesHistory.push(msg);
    //     //broadicasting the message to everyone
    //     io.emit('client-player-input',msg);
    // });

    //log the user id disconnecting
    socket.on('disconnect', () => {
        console.log('Player disconnected: ' + socket.id);
        playersOn.splice(playersOn.indexOf(socket),1);
        console.log('Players remaining: ' + playersOn.length);
    });
});




