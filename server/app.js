const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const {Server} = require("socket.io");

const {Road} = require("./road.js")
const {Player} = require("./player.js")

const loop = require('node-gameloop');

class GameColors{
    static backgroundColor = "#1199FF";
    static skyColor = "#5AB8FF";
    static hillsColor = "#000";
}

const gameAcceleration = 0.03;
const groundFriction = 0.01;

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
let road = new Road(500,180,180,500);  
let sky = new Road(200,30,300,500);  

let users = [];
let players = [];


//handle here all the multiplayer stuff
io.on("connection", (socket) => {

    console.log("User conneted: " + socket.id);
    users.push(socket);

    //game request by client
    socket.on("request-game", () =>{
        console.log("game requested");
        //send the noise values and create a player
        socket.emit("prepare-game",{road: road.noise.getValues(), sky: sky.noise.getValues()});
    });

    socket.on("game-started", () =>{
        console.log("game started");
        socket.emit("create-player",socket.id);
    });

    socket.on("player-created",(playerData) =>{
        
        //tell to the other player already in the game create a enemy now
        players.forEach(p => {
            p.socket.emit("create-enemy",playerData);
        });
        
        //tell to this player create all the other enemys already here
        players.forEach(p => {
            //FIX with last player position if needed
            socket.emit("create-enemy",{
            id: p.id,
            rotation: p.rotation,
            rotSpeed: p.rotSpeed,
            speedY: p.speedY,
            speed: p.speed,
            x: p.x,
            y: p.y,
            playerOffsetX: p.playerOffsetX,
            grounded: p.grounded,
            lastGroundedState: p.lastGroundedState,
            width: p.width
            });
        });

        //now add it to the players array
        let p = new Player(socket);

        p.id =  playerData.id;
        p.rotation = playerData.rotation;
        p.rotSpeed = playerData.rotSpeed;
        p.speedY = playerData.speedY;
        p.speed = playerData.speed;
        p.x = playerData.x;
        p.y = playerData.y;
        p.playerOffsetX = playerData.playerOffsetX;
        p.grounded = playerData.grounded;
        p.lastGroundedState = playerData.lastGroundedState;
        p.width = playerData.width;

        p.onGrounded = onPlayerGrounded;

        players.push(p);
    });


    socket.on("update-player-speed", (playerData) =>{

        let p = getPlayerFromSocket(socket);
        p.controlSpeed = playerData.control;

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

        let p = getPlayerFromSocket(socket);
        p.controlRotation = playerData.control;

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

function updatePlayerPosition(player)
{
    let gravityAcelleration = (player.rotation/Math.PI/4) * 0.3;

    if(player.controlSpeed && player.grounded){
        player.speed += player.controlSpeed*gameAcceleration + gravityAcelleration;
    }
    else if(player.grounded)
    {
        if(gravityAcelleration < 0)
            player.speed -=  player.speed*groundFriction - gravityAcelleration*0.5;
        else
            player.speed +=  player.speed*(-groundFriction) + gravityAcelleration*0.5;

    }

    let playerY = road.getRoadY(player.x + player.playerOffsetX);
    player.setPositionY(playerY);
}

function updatePlayerRotation(player)
{
    if(player.controlRotation){
        player.rotSpeed = 0.1;
        player.rotate(player.controlRotation);
    }

    let roadAngle = getRoadAngle(player);
    if(player.grounded){
        player.rotSpeed = 0.3;
        player.rotate(player.rotation + roadAngle);
    }
}

function onPlayerGrounded(player)
{
    let playerAngle = player.rotation;
    let roadAngle = getRoadAngle(player);

    let angle = playerAngle + roadAngle;

    if(angle > Math.PI / 2  || angle < -Math.PI/1.65)
    {
        //player should die here FINISHING state on client
        console.log("Player died: " + player.id);
    }
}

function getRoadAngle(player)
{
    return road.getRoadAngle(
        player.x + player.playerOffsetX - player.width/3,
        player.x + player.playerOffsetX + player.width/3
    );
}

// GAMELOOP ON SERVER
// start the loop at 30 fps (1000/30ms per frame) and grab its id
// let frameCount = 0;
let deltaTimeGame = 1000/100; // 16.666ms
let deltaTimeSocket = 1000/10; //500 ms

const gameLoopId = loop.setGameLoop(function(dt) {
    // console.log('Hi there! (frame=%s, delta=%s)', frameCount++, dt);
    players.forEach(player => {
        updatePlayerRotation(player);
        updatePlayerPosition(player);
    });

}, deltaTimeGame);

const socketLoopId = loop.setGameLoop(function(dt){
   players.forEach(player => {
        io.emit("fix-player-position",{
            id: player.id,
            rotation: player.rotation,
            rotSpeed: player.rotSpeed,
            speedY: player.speedY,
            speed: player.speed,
            x: player.x,
            y: player.y,
            grounded: player.grounded,
            lastGroundedState: player.lastGroundedState
        });
    });
},deltaTimeSocket);

// stop the loop 2 seconds later
// setTimeout(function() {
//     console.log('2000ms passed, stopping the game loop');
//     gameloop.clearGameLoop(id);
// }, 2000);