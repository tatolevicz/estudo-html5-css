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

const gameAcceleration = 0.06;
const groundFriction = 0.02;

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
    addUser(socket);

    //game request by client
    socket.on("request-game", () =>{
        console.log("game requested");
        //send the noise values and create a player
        socket.emit("prepare-game",{road: road.noise.getValues(), sky: sky.noise.getValues()});
    });

    socket.on("game-start", () =>{
        console.log("game start: " + socket.id);
        socket.emit("create-player",socket.id);
    });

    socket.on("game-re-start", (playerData) =>{
        console.log("game re-started: " + socket.id);

        //tell to the other users already in the server create a enemy now
        users.forEach(p => {
            p.socket.emit("create-enemy",playerData);
        });
    
        socket.emit("restart-game",playerData);

         //now add it again to the players array
        addPlayer(socket,playerData);

        console.log("Number of players active: " + players.length);
    });

    socket.on("player-died", (id) =>{
        console.log("player died: " + id);
        removePlayer(socket);
        socket.broadcast.emit("delete-enemy",id);
    });

    socket.on("player-created",(playerData) =>{
        
        //tell to the other users already in the game create a enemy now
        users.forEach(p => {
            p.socket.emit("create-enemy",playerData);
        });

        //now add it to the players array
        addPlayer(socket,playerData);
    });


    socket.on("update-player-speed", (playerData) =>{
        let p = getPlayerFromSocket(socket);
        //sometimes the p is undefined I dont know why yet
        if(p) p.controlSpeed = playerData.control;
    });

    socket.on("update-player-rotation", (playerData) =>{
        let p = getPlayerFromSocket(socket);
        //sometimes the p is undefined I dont know why yet
        if(p) p.controlRotation = playerData.control;
    });

    socket.on("disconnect", () =>{
        console.log("User disconneted: " + socket.id);
        users.splice(users.indexOf(socket),1);
        players.splice(players.indexOf(getPlayerFromSocket(socket)),1);
        socket.broadcast.emit("delete-enemy",socket.id);

        console.log("Users: conneted: " + users.length);
        console.log("Players playing: " + players.length);
    });

    console.log("Users: conneted: " + users.length);
    console.log("Players playing: " + players.length);
});

function addUser(socket){
    let user = new Player(socket);

    user.id = socket.id;
    user.rotation = 0;
    user.rotSpeed = 0;
    user.speedY = 0;
    user.speed = 0;
    user.x = 0;
    user.y = 0;
    user.playerOffsetX = 0;
    user.grounded = false;
    user.lastGroundedState = false;
    user.width = 0;

    user.onGrounded = onPlayerGrounded;
    users.push(user);

    //tell to this player create all the other enemys already playing just to watch
    players.forEach(p => {
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
}

function removePlayer(socket){
    let player = getPlayerFromSocket(socket);
    if(!player) return;
    //add to the players array now
    players.splice(players.indexOf(player),1);
    console.log("Player removed from active players: " + players.length);
}

function addPlayer(socket, playerData){
    let user = getUserFromSocket(socket);

    if(!user) return;

    //update the data of that user becoming a player
    user.id = socket.id;
    user.rotation = playerData.rotation;
    user.rotSpeed = playerData.rotSpeed;
    user.speedY = playerData.speedY;
    user.speed = playerData.speed;
    user.x = playerData.x;
    user.y = playerData.y;
    user.playerOffsetX = playerData.playerOffsetX;
    user.grounded = playerData.grounded;
    user.lastGroundedState = playerData.lastGroundedState;
    user.width = playerData.width;

    //add to the players array now
    players.push(user);
}

function getPlayerFromSocket(socket)
{
    for (let index = 0; index < players.length; index++) {
        const player = players[index];
        if(player.socket === socket)
            return player;
    }        
}


function getUserFromSocket(socket)
{
    for (let index = 0; index < users.length; index++) {
        const user = users[index];
        if(user.socket === socket)
            return user;
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
        console.log("Player died: " + player.x);
        player.diePosX = player.x;
        io.emit("player-start-die",player.id);

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
let deltaTimeSocket = 1000/30; //500 ms

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