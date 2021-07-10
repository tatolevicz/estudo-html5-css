const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const {Server} = require("socket.io");

const {Noise} = require("./scripts/server/noise.js")

const io = new Server(server);

app.get("/",(req,res) => {
    res.sendFile(__dirname + "/index.html");
});

server.listen(3000,() =>{
    console.log("server running!");
});

app.use(express.static(__dirname + "/"));


//game objects on the server side
let roadNoise = new Noise(500,180);
let skyNoise = new Noise(200,300);

let players = [];


//handle here all the multiplayer stuff
io.on("connection", (socket) => {

    console.log("User conneted: " + socket.id);
    players.push(socket);

    /*
    if it's the first player on the game populate the noise
    populate the values for road and sky
    */
    if(players.length === 1){   
        roadNoise.populate();
        skyNoise.populate();
    }


    socket.on("request-game", () =>{
        console.log("game requested");
        //send the noise values and create a player
        socket.emit("prepare-game",{road: roadNoise.getValues(), sky: skyNoise.getValues()});
    });



    socket.on("disconnect", () =>{
        console.log("User disconneted: " + socket.id);
        players.splice(players.indexOf(socket),1);
    });
    
    console.log("Players: conneted: " + players.length);

});