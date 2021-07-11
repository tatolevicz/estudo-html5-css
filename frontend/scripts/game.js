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

let socket = io("http://localhost:3000");

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
        this.gameSpeed = 0;
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
            this.addPlayer();
            this.player.id = id;

            socket.emit("player-created",{
                posX: this.player.x, 
                posY: this.player.y, 
                offSetX: this.player.playerOffsetX
            });

            this.states.setState(States.STARTING);
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

        this.socket.on("update-player",(playerData) => {
            this.player.x = playerData.posX;
            this.player.setPositionY(playerData.posY);
            this.player.playerOffsetX = playerData.offSetX;
            this.player.rotation = playerData.rotation;
            this.player.speed = playerData.speed;
        });

        this.socket.on("update-enemy",(playerData) => {
            for (let index = 0; index < this.enemys.length; index++) {
                const enemy = this.enemys[index];
                if(enemy.id == playerData.id){
                    enemy.x = playerData.posX - this.player.x;
                    enemy.playerOffsetX = playerData.offSetX;
                    enemy.setPositionY(playerData.posY);
                    enemy.rotation = playerData.rotation;
                    enemy.speed = 0;
                    break;
                    
                }   
            }
        });
    }

    createRoad(){
        this.road = new Road(this.canvas, 0, this.canvas.width*1.1, this.canvas.height, this.canvas.height, 500,180, 160, GameColors.hillsColor,true,false,1.0);  
    }

    createSky(){
        this.sky = new Road(this.canvas, 0, this.canvas.width*1.1, 0, 0, 200,30, 300, GameColors.skyColor,true,true,0.1);
    }

    addPlayer(){
        this.player = new Player(0.7, true);
        this.player.playerOffsetX = this.canvas.width/4;
        this.player.onGrounded = this.onPlayerGrounded.bind(this);
    }

    addEnemy(data){

        if(this.player.id === data.id) return;

        let enemy = new Player(0.7, false);
        enemy.id = data.id;
        enemy.playerOffsetX = data.offSetX;
        enemy.x = data.posX;
        enemy.y = data.posY;
        enemy.setPositionY(enemy.y);
        this.enemys.push(enemy);

        console.log("Enemy added!");
    }

    onPlayerGrounded()
    {
        let playerAngle = this.player.rotation;
        let roadAngle = this.getRoadAngle();

        let angle = playerAngle + roadAngle;

        if(angle > Math.PI / 2  || angle < -Math.PI/1.65)
        {
            this.states.setState(States.FINISHING);
        }
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
                this.updatePlayerRotation();
                this.updatePlayerPosition();
                
                break;
            case States.PLAYING: 
                //update the position and rotation of player
                this.updatePlayerRotation();
                this.updatePlayerPosition();
                break;
            case States.FINISHING: 

                this.player.playerOffsetX -= 5
                this.player.rotation -= Math.PI * 0.2;

                this.gameSpeed -= this.gameSpeed*this.gameAcceleration*3;

                this.updatePlayerPosition();

                if(this.gameSpeed <= 0.05){
                    this.states.setState(States.FINISHED);
                }

                break;
            case States.FINISHED: 
                    this.gameSpeed = 0;
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

    }

    updatePlayerPosition()
    {
        let playerY = this.road.getRoadY(this.player.x + this.player.playerOffsetX);
        this.socket.emit("update-player-data",{
            id: this.player.id,
            posX: this.player.x,
            posY: playerY,
            offSetX: this.player.playerOffsetX,
            rotation: this.player.rotation,
            speed: this.player.speed
        });
    }


    updatePlayerRotation()
    {
        let roadAngle = this.getRoadAngle();
        if(this.player.grounded){
            this.player.rotSpeed = 0.3;
            this.player.rotate(this.player.rotation + roadAngle);
        }
    }

    getRoadAngle()
    {
        return this.road.getRoadAngle(
            this.player.x + this.player.playerOffsetX - this.player.width/3,
            this.player.x + this.player.playerOffsetX + this.player.width/3
        );
    }

    inputs(){

        let inputSpeed = (this.inputHandler.controls.ArrowUp - this.inputHandler.controls.ArrowDown);

        let gravityAcelleration = (this.player.rotation/Math.PI/4) * 0.3;

        if(inputSpeed && this.player.grounded)
        {
            this.gameSpeed += (this.inputHandler.controls.ArrowUp - this.inputHandler.controls.ArrowDown)*this.gameAcceleration + gravityAcelleration;
        }
        else if(this.player.grounded)
        {
            if(gravityAcelleration < 0)
                this.gameSpeed -=  this.gameSpeed*this.groundFriction - gravityAcelleration*0.5;
            else
                this.gameSpeed +=  this.gameSpeed*(-this.groundFriction) + gravityAcelleration*0.5;

        }

        let rotDirection = (this.inputHandler.controls.ArrowLeft - this.inputHandler.controls.ArrowRight);
        
        this.player.rotSpeed = 0.1;
        this.player.rotate(rotDirection);

        this.player.speed = this.gameSpeed;

        // console.log(this.gameSpeed);
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


