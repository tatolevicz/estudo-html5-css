// import {Noise} from "./scripts/noise";
/*
1 - get the canvas context
2 - set the canvas size
3 - create a procedural hills terrain
4 - move the terrain looping the content
5 - create sky background as the terrain with different speed
6 - create player with png image
7 - draw the player at the top of the road
8 - fix the angle of player with the road angle
9 - create gravity
10 - create player's road collison
11 - move player with aceleration with arrows
12 - use state machine in the game loop
13 - make game over flow
14 - mobile controls with acelerometer
*/

import { Road } from "./road.js";
import { Player } from "./player.js";
import { GameColors } from "./colors.js";
import { States } from "./states.js";
import { InputHandler } from "./input.js";


// COMPUTE ENGINE - GCE
// let socket = io("http://35.199.124.252:8080"); 

//APP Engine - GAE
// let socket = io("https://tato-game-servers.rj.r.appspot.com/"); 

// LOCAL HOST NODE
let socket = io("http://localhost:8080");

class Game{
    constructor(socket) {

        this.socket = socket;
        this.startBtn = document.querySelector("#startGameBtn");
        this.uiContainer = document.querySelector("#container-ui");
        this.enemys = [];
        this.states = new States();
        // step 1
        this.canvas = document.querySelector("canvas");
        this.context = this.canvas.getContext("2d");

        //step 2
        this.canvas.width = window.innerWidth * 0.8 < 1000 ? window.innerWidth * 0.8 : 1000;
        this.canvas.height = 500;
        this.gameAcceleration = 0.03;
        this.groundFriction = 0.01;

        this.inputHandler = new InputHandler();

        window.onkeydown = ev => this.inputHandler.controls[ev.key] = 1;
        window.onkeyup = ev => this.inputHandler.controls[ev.key] = 0;


        this.startBtn.addEventListener("click",() => {
            this.hideUI();
            this.socket.emit("game-started");
        });

        //SOCKETS 
        this.socket.on("prepare-game",(data) =>{
            this.onPrepareGame(data);
        });

        this.socket.emit("request-game");

        this.socket.on("create-player",(id) =>{
            this.addPlayer(id);
        });

        this.socket.on("create-enemy",(data) =>{
            this.addEnemy(data);
        });

        this.socket.on("delete-enemy",(id) => {

            let idx = -1;
            for (let index = 0; index <  this.enemys.length; index++) {
                const enemy = this.enemys[index];
                if(enemy.id == id) {
                    idx = index;
                    break;
                }
            }

            if(idx != -1)
                this.enemys.splice(idx,1);
        });

        this.socket.on("update-player-speed",(playerData) => {
            this.player.controlSpeed = playerData.control;
        });

        this.socket.on("update-player-rotation",(playerData) => {
            this.player.controlRotation = playerData.control;
        });

        this.socket.on("update-enemy-speed",(playerData) => {
            let enemy = this.getEnemyById(playerData.id);
            if(enemy){
                enemy.controlSpeed = playerData.control;
            }
        });

        this.socket.on("update-enemy-rotation",(playerData) => {
            let enemy = this.getEnemyById(playerData.id);
            if(enemy){
                enemy.controlRotation = playerData.control;
            }
        });

        socket.on("fix-player-position",(playerData)=>{

            //  id: player.id,
            if(this.player && this.player.id == playerData.id){
                this.player.rotation =  playerData.rotation;
                this.player.rotSpeed = playerData.rotSpeed;
                this.player.speedY = playerData.speedY;
                this.player.speed = playerData.speed;
                this.player.x = playerData.x;
                this.player.y = playerData.y;
                this.player.grounded = playerData.grounded;
                this.player.lastGroundedState = playerData.lastGroundedState;
            }

            let enemy = this.getEnemyById(playerData.id);
            if(enemy){
                enemy.rotation =  playerData.rotation;
                enemy.rotSpeed = playerData.rotSpeed;
                enemy.speedY = playerData.speedY;
                enemy.speed = playerData.speed;
                enemy.x = playerData.x - this.player.x;
                enemy.y = playerData.y;
                enemy.grounded = playerData.grounded;
                enemy.lastGroundedState = playerData.lastGroundedState;
            }
        });
    }

    getEnemyById(id)
    {
        for (let index = 0; index < this.enemys.length; index++) {
            const element = this.enemys[index];
            if(this.enemys[index].id == id)
                return this.enemys[index];
        }

        return null;
    }

    createRoad(){
        this.road = new Road(this.canvas, 0, this.canvas.width*1.1, this.canvas.height, this.canvas.height, 500,180, 160, GameColors.hillsColor,true,false,1.0);  
    }

    createSky(){
        this.sky = new Road(this.canvas, 0, this.canvas.width*1.1, 0, 0, 200,30, 300, GameColors.skyColor,true,true,0.1);
    }

    addPlayer(id){
        this.player = new Player(0.7, true);
        this.player.playerOffsetX = this.canvas.width/4;
        this.player.id = id;
        this.player.onGrounded = this.onPlayerGrounded.bind(this);
        this.player.onPlayerReady = this.onPlayerReady.bind(this);
    }

    addEnemy(data){
        if(this.player.id === data.id) return;

        let enemy = new Player(0.7, false);

        enemy.id = data.id;
        enemy.rotation = data.rotation;
        enemy.rotSpeed = data.rotSpeed;
        enemy.speedY = data.speedY;
        enemy.speed = data.speed;
        enemy.x = data.x;
        enemy.y = data.y;
        enemy.playerOffsetX = data.playerOffsetX;
        enemy.grounded = data.grounded;
        enemy.lastGroundedState = data.lastGroundedState;

        enemy.onGrounded = this.onPlayerGrounded.bind(this);

        
        this.enemys.push(enemy);

        
        console.log("Enemy added!");
    }

    onPlayerGrounded(player)
    {
        let playerAngle = player.rotation;
        let roadAngle = this.getRoadAngle(player);

        let angle = playerAngle + roadAngle;
        console.log("Player client grounded: " + angle);

        if(player === this.player){
            if(angle > Math.PI / 2  || angle < -Math.PI/1.65)
            {
                this.states.setState(States.FINISHING);
            }
        }
    }
    
    onPlayerReady(player)
    {
        this.socket.emit("player-created",{
            id: player.id,
            rotation: player.rotation,
            rotSpeed: player.rotSpeed,
            speedY: player.speedY,
            speed: player.speed,
            x: player.x,
            y: player.y,
            playerOffsetX: player.playerOffsetX,
            grounded: player.grounded,
            lastGroundedState: player.lastGroundedState,
            width: player.width
        });

        this.states.setState(States.STARTING);
    }

    loop(){
        if(this.isPlaying())
            this.inputs();

        //update game logic and objects
        this.update();

        //update canva's game
        this.draw();
        
    }

    draw(){
        //draw the background first
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.context.fillStyle = GameColors.backgroundColor;
        this.context.fillRect(0,0,this.canvas.width, this.canvas.height);

        //draw the sky to be the most far element in front the background
        if(this.sky)
            this.sky.draw();

        //draw the road and player with any sequence cause they will not overlap each other
        if(this.road)
            this.road.draw();

        this.enemys.forEach(enemy => {
            enemy.draw();
        });

        if(this.player)
            this.player.draw();

    }

    update(){

        //do the game logic
        switch (this.states.getState()) {
            case States.STARTING:

                if(this.player.grounded) {
                    this.states.setState(States.PLAYING)
                    break;
                }
        
                //update the position and rotation of player
                this.updatePlayerRotation(this.player);
                this.updatePlayerPosition(this.player);

                this.enemys.forEach(enemy => {
                    this.updatePlayerRotation(enemy);
                    this.updatePlayerPosition(enemy);
                });    
                break;
            case States.PLAYING: 
                //update the position and rotation of player
                this.updatePlayerRotation(this.player);
                this.updatePlayerPosition(this.player);
                this.enemys.forEach(enemy => {
                    this.updatePlayerRotation(enemy);
                    this.updatePlayerPosition(enemy);
                });
                break;
            case States.FINISHING: 

                this.player.playerOffsetX -= 5
                this.player.rotation -= Math.PI * 0.2;

                this.player.speed -= this.player.speed*this.gameAcceleration*3;

                this.updatePlayerPosition(this.player);

                if(this.player.speed <= 0.05){
                    this.states.setState(States.FINISHED);
                }

                break;
            case States.FINISHED: 
                    this.player.speed = 0;
                    this.player.playerOffsetX = this.canvas.width/4;
                    this.player.x = this.road.currentX;
                    this.uiContainer.setAttribute("style","display: flex !important");
                    this.player.rotation = 0;
                    this.player.y = -this.player.height;
                    this.states.setState(States.NONE);
                break;
            case States.NONE: 
                break
            default:
                break;
        }

        if(this.player && this.player.shouldStickWithCamera)
        {
            this.road.currentX = this.player.x;
            this.sky.currentX = this.player.x;
        }

        // if(this.player)
        //     console.log(this.player.x);


    }

    updatePlayerPosition(player)
    {
        let gravityAcelleration = (player.rotation/Math.PI/4) * 0.3;

        if(player.controlSpeed && player.grounded){
            player.speed += player.controlSpeed*this.gameAcceleration + gravityAcelleration;
        }
        else if(player.grounded)
        {
            if(gravityAcelleration < 0)
                player.speed -=  player.speed*this.groundFriction - gravityAcelleration*0.5;
            else
                player.speed +=  player.speed*(-this.groundFriction) + gravityAcelleration*0.5;

        }

        let playerY = this.road.getRoadY(player.x + player.playerOffsetX);
        player.setPositionY(playerY);
    }


    updatePlayerRotation(player)
    {
        if(player.controlRotation){
            player.rotSpeed = 0.1;
            player.rotate(player.controlRotation);
        }

        let roadAngle = this.getRoadAngle(player);
        if(player.grounded){
            player.rotSpeed = 0.3;
            player.rotate(player.rotation + roadAngle);
        }
    }

    getRoadAngle(player)
    {
        return this.road.getRoadAngle(
            player.x + player.playerOffsetX - player.width/3,
            player.x + player.playerOffsetX + player.width/3
        );
    }

    inputs(){
        let inputSpeed = (this.inputHandler.controls.ArrowUp - this.inputHandler.controls.ArrowDown);
        if(inputSpeed != this.player.controlSpeed)
        {
            this.socket.emit("update-player-speed",{
                id: this.player.id,
                control: inputSpeed,
                worldPosX: this.player.x + this.player.playerOffsetX,
                posY: this.player.y,
                rotation: this.player.rotation
            });
        }

        let rotDirection = (this.inputHandler.controls.ArrowLeft - this.inputHandler.controls.ArrowRight);

        if(rotDirection != this.player.controlRotation)
        {
            this.socket.emit("update-player-rotation",{
                id: this.player.id,
                control: rotDirection,
                worldPosX: this.player.x + this.player.playerOffsetX,
                posY: this.player.y,
                rotation: this.player.rotation
            });
        }
    }

    isPlaying()
    {
        return this.states.getState() === States.PLAYING;
    }

    showUI(){
        this.uiContainer.setAttribute("style","display: flex !important");
    }

    hideUI(){
        this.uiContainer.setAttribute("style","display: none !important");
    }

    //SOCKET ENTRIES
    onPrepareGame(data){
        this.createRoad();
        this.road.yValues = data.road;
        this.createSky();
        this.sky.yValues = data.sky;
        this.showUI();
    } 

}

var game = new Game(socket);

function mainLoop(){
    game.loop();
    requestAnimationFrame(mainLoop);
}

mainLoop();

window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);


