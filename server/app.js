const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const {Server} = require("socket.io");

const {Noise} = require("./noise.js")

const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

app.get("/",(req,res) => {
    // res.sendFile(__dirname + "/index.html");
    res.send("This app is a server for the Bike Hills game available here: \n https://tatolevicz.github.io/")
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.use(express.static(__dirname + "/"));


//game objects on the server side
let roadNoise = new Noise(500,180);
let skyNoise = new Noise(200,300);

class Player{
    constructor(socket,worldPosX,posY,rotation){
        this.socket = socket;
        this.worldPosX = worldPosX;
        this.posY = posY;   
        this.rotation = rotation;
    }
}

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
            p.socket.emit("create-enemy",{
                id: socket.id,
                worldPosX: playerData.worldPosX,
                posY: playerData.posY,
                rotation: playerData.rotation
            });
        });
        

        //tell to this player create all the other enemys already here
        players.forEach(p => {
            //FIX with last player position if needed
            socket.emit("create-enemy",{
                id: p.socket.id,
                worldPosX: p.worldPosX,
                posY: p.posY,
                rotation: p.rotation
            });
        });

        //now add it to the players array
        let p = new Player(socket,playerData.worldPosX,playerData.posY,playerData.rotation)
        players.push(p);
    });



    socket.on("update-player-speed", (playerData) =>{

        // console.log(playerData);
        socket.emit("update-player-speed",{
            control: playerData.control,
        });

        socket.broadcast.emit("update-enemy-speed",{
                id: socket.id,
                control: playerData.control
        });
    });

    socket.on("update-player-rotation", (playerData) =>{

        // console.log(playerData);
        socket.emit("update-player-rotation",{
            control: playerData.control
        });

        socket.broadcast.emit("update-enemy-rotation",{
                id: socket.id,
                control: playerData.control
        });
    });

    // socket.on("player-die", () =>{
    //     console.log("Player died: " + socket.id);
    //     players.splice(players.indexOf(getPlayerFromSocket(socket)),1);
    //     // socket.broadcast.emit("enemy-die",socket.id);
    //     console.log("Players playing: " + players.length);
    // });

    socket.on("disconnect", () =>{
        console.log("User disconneted: " + socket.id);
        users.splice(users.indexOf(socket),1);
        players.splice(players.indexOf(getPlayerFromSocket(socket)),1);
        socket.broadcast.emit("delete-enemy",socket.id);
    });

    console.log("Users: conneted: " + users.length);
    console.log("Players playing: " + players.length);
});

function getPlayerFromSocket(socket)
{
    for (let index = 0; index < players.length; index++) {
        const player = players[index];
        if(player.socket === socket)
            return player;
    }        

}