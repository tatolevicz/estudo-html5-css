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

let users = [];
let players = [];

//handle here all the multiplayer stuff
io.on("connection", (socket) => {

    console.log("User conneted: " + socket.id);
    users.push(socket);

    /*
    if it's the first player on the game populate the noise
    populate the values for road and sky
    */
    if(users.length === 1){   
        roadNoise.populate();
        skyNoise.populate();
    }

    //game request by client
    socket.on("request-game", () =>{
        console.log("game requested");
        //send the noise values and create a player
        socket.emit("prepare-game",{road: roadNoise.getValues(), sky: skyNoise.getValues()});
    });

    socket.on("game-started", () =>{
        console.log("game started");
        //send the noise values and create a player
        socket.emit("create-player",socket.id);
    });

    socket.on("player-created",(playerData) =>{
        //tell to the other player already in the game create a enemy now
        players.forEach(p => {
            p.emit("create-enemy",{
                id: socket.id,
                posX: playerData.posX,
                posY: playerData.posY,
                offSetX: playerData.offSetX
            });
        });
        

        //tell to this player create all the other enemys already here
        players.forEach(p => {
            //FIX with last player position if needed
            socket.emit("create-enemy",{
                id: p.id,
                posX: playerData.posX,
                posY: playerData.posY,
                offSetX: playerData.offSetX
            });
        });

        //now add it to the players array
        players.push(socket);
    });



    socket.on("update-player-data", (playerData) =>{

        // console.log(playerData);
        socket.emit("update-player",{
            posX: playerData.posX,
            posY: playerData.posY,
            offSetX: playerData.offSetX,
            rotation: playerData.rotation,
            speed: playerData.speed
        });

        socket.broadcast.emit("update-enemy",{
                id: socket.id,
                posX: playerData.posX,
                posY: playerData.posY,
                offSetX: playerData.offSetX,
                rotation: playerData.rotation,
                speed: playerData.speed
        });
    });


    socket.on("disconnect", () =>{
        console.log("User disconneted: " + socket.id);
        users.splice(users.indexOf(socket),1);
        players.splice(players.indexOf(socket),1);
        socket.broadcast.emit("delete-enemy",socket.id);
    });

    console.log("Users: conneted: " + users.length);
    console.log("Players playing: " + players.length);

});