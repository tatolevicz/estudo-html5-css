

var socket = io();


socket.on("client-populate-road", (yValues) => {
    this.road.yValues = yValues;
    console.log(yValues);
});

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
import { Enemy } from "./enemy.js";
import { GameColors } from "./colors.js";
import { States } from "./states.js";
import { InputHandler } from "./input.js";


class ClientGame{
    constructor(socket) {
        this.socket = socket;
        this.startBtn = document.querySelector("#startGameBtn");
        this.uiContainer = document.querySelector("#container-ui");
        this.enemys = [];

        this.states = new States();
        this.states.setState(States.WAITING_SERVER);

        this.canvas = document.querySelector("canvas");
        this.context = this.canvas.getContext("2d");

        this.road = undefined;
        this.sky = undefined;
        this.player = undefined;

        this.canvas.width = window.innerWidth * 0.8 < 1000 ? window.innerWidth * 0.8 : 1000;
        this.canvas.height = 500;
        this.gameSpeed = 0;
        this.gameAcceleration = 0.01;

        this.inputHandler = new InputHandler();

        this.playerOffsetX = this.canvas.width/4;


        window.onkeydown = ev => this.inputHandler.controls[ev.key] = 1;
        window.onkeyup = ev => this.inputHandler.controls[ev.key] = 0;

    
        this.startBtn.addEventListener("click",() => {
            // socket.emit("start-game-pressed");
        });


        socket.on("client-create-road",(values) =>{
            this.createRoad(values);
        });

        socket.on("client-create-sky",(values) =>{
            this.createSky(values);
        });

        socket.on("client-create-player",(playerId) =>{
            this.createPlayer(playerId);
        });

        socket.on("client-create-enemy",(playerId) =>{
            this.createEnemy(playerId);
        });

        socket.on("client-update-enemy",(enemyData) =>{              

            this.updateEnemy(enemyData.id, 
                enemyData.x,
                enemyData.y, 
                enemyData.angle,
                enemyData.speed);

            // console.log(enemyData);
        });

        socket.on("client-update-player",(playerData) =>{              

            this.updatePlayer( 
                playerData.x,
                playerData.y, 
                playerData.angle,
                playerData.speed);

            // console.log(playerData);
        });
        // socket.on("client-init-game",() => {
        //     this.uiContainer.setAttribute("style","display: none !important");
        //     this.states.setState(States.STARTING);
        // });
    }


    createRoad(yValues){
    // step 3 and 4
        this.road = new Road(
            this.canvas, 
            0, 
            this.canvas.width*1.1, 
            this.canvas.height, 
            this.canvas.height, 
            500,
            180, 
            160, 
            GameColors.hillsColor,
            true,
            false,
            3.0);  

        this.road.yValues = yValues;
    }
    

    createSky(yValues){
            // step 3 and 4
        this.sky = new Road(
            this.canvas, 
            0, 
            this.canvas.width*1.1, 
            0, 
            0, 
            200,
            30, 
            300, 
            GameColors.skyColor,
            true,
            true,
            0.8);

        this.sky.yValues = yValues;
    }

    createPlayer(playerId){
        let img = new Image();
        img.src = './assets/images/player.png';
        this.player = new Player(img,0.7,playerId);
        this.player.onGrounded = this.onPlayerGrounded.bind(this);
    }

    createEnemy(playerId){

        if(playerId === this.player.id) return;

        let img = new Image();
        img.src = './assets/images/player.png';
        let enemy = new Enemy(img,0.7,playerId);

        enemy.x = this.playerOffsetX;
        enemy.y =  this.canvas.height/2;

        this.enemys.push(enemy);

        console.log("Enemys: " + this.enemys.length);

    }

    shouldReleaseStartUI()
    {
        return this.road && this.sky;// && this.player;
    }
    

    onPlayerGrounded()
    {
        let playerAngle = this.player.rotation;
        let roadAngle = this.getRoadAngle(this.playerOffsetX);

        let angle = playerAngle + roadAngle;

        if(angle > Math.PI / 2  || angle < -Math.PI/1.65)
        {
            this.states.setState(States.FINISHING);
        }
    }

    loop(){
        // if(this.isPlaying())
        //     this.inputs();

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

        if(this.states.getState() === States.WAITING_SERVER)
            return;
        //draw the sky to be the most far element in front the background
        this.sky.draw();

        //draw the road and player with any sequence cause they will not overlap each other
        this.road.draw();

        if(this.player)
            this.player.draw();

        this.enemys.forEach(e => {
            e.draw();
        });
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
                this.sky.setSpeed(this.gameSpeed);
                this.road.setSpeed(this.gameSpeed);
                this.player.setSpeed(this.gameSpeed);
                //update the position and rotation of player
                this.updatePlayerRotation();
                this.updatePlayerPosition();
                break;
            case States.FINISHING: 
                this.playerOffsetX -= 5
                this.player.rotation -= Math.PI * 0.2;

                this.gameSpeed -= this.gameSpeed*this.gameAcceleration*3;

                this.sky.setSpeed(this.gameSpeed);
                this.road.setSpeed(this.gameSpeed);
                this.player.setSpeed(this.gameSpeed);

                this.updatePlayerPosition();

                if(this.gameSpeed <= 0.05){
                    this.states.setState(States.FINISHED);
                }

                break;
            case States.FINISHED: 
                    this.gameSpeed = 0;
                    this.playerOffsetX = this.canvas.width/4;
                    this.uiContainer.setAttribute("style","display: flex !important");
                    this.player.rotation = 0;
                    this.player.setPosition(this.playerOffsetX, -this.player.height);
                    this.states.setState(States.NONE);
                break;
            case States.NONE: 
                this.gameSpeed -= this.gameSpeed*this.gameAcceleration*3;
                break
            case States.WAITING_SERVER:
                if(this.shouldReleaseStartUI())
                {
                    // this.uiContainer.setAttribute("style","display: flex !important");
                    // this.uiContainer.setAttribute("style","display: none !important");
                    this.states.setState(States.STARTING);
                    // this.states.setState(States.NONE);
                }
            break;
            default:
                break;
        }
    }

    updatePlayerPosition()
    {
        let playerX = this.playerOffsetX;
        let playerY = this.road.getRoadY(this.road.getRoadPosition(playerX));

        this.player.realXPos = this.road.getRoadPosition(playerX);
        
        this.socket.emit("player-input",
        {
            id: this.player.id,
            realX: this.player.realXPos,
            x: playerX,
            y: playerY, 
            angle:  this.player.rotation,
            speed: this.gameSpeed
        });
    }

    updatePlayerRotation()
    {
    
        let roadAngle = this.getRoadAngle(this.playerOffsetX);
        if(this.player.grounded){
            this.player.rotSpeed = 0.3;
            this.player.rotate(this.player.rotation + roadAngle);
        }
    }

    updateEnemy(enemyId,x,y,rad, speed)
    {
        for (let index = 0; index < this.enemys.length; index++)
        {
            const enemy = this.enemys[index];

            if(enemy.id === enemyId)
            {
                enemy.x = x;
                enemy.y = y;

                enemy.rotSpeed = 0.3;
                enemy.rotation = rad;

                enemy.speed = speed;
                break;
            }
        }
    }


    updatePlayer(x,y,rad, speed)
    {
        this.player.setPosition(x,y);

        this.player.rotSpeed = 0.3;
        this.player.rotation = rad;
        this.player.speed = speed;
    }


    getRoadAngle(x)
    {
        return this.road.getRoadAngle(
            this.road.getRoadPosition(x) - this.player.width/3,
            this.road.getRoadPosition(x) + this.player.width/3
            );
    }

    inputs(){

        let inputSpeed = (this.inputHandler.controls.ArrowUp - this.inputHandler.controls.ArrowDown);

        let gravityAcelleration = (this.player.rotation/Math.PI/4) * 0.5;

        if(inputSpeed && this.player.grounded)
        {
            this.gameSpeed += (this.inputHandler.controls.ArrowUp - this.inputHandler.controls.ArrowDown)*(this.gameAcceleration + gravityAcelleration);
            if(this.gameSpeed < 0)
                this.gameSpeed = 0;
        }
        else if(this.player.grounded)
        {
            this.gameSpeed -=  this.gameSpeed*this.gameAcceleration - gravityAcelleration*0.5;
        }

        let rotDirection = (this.inputHandler.controls.ArrowLeft - this.inputHandler.controls.ArrowRight);
        
        this.player.rotSpeed = 0.1;
        this.player.rotate(rotDirection);
    }

    isPlaying()
    {
        return this.states.getState() === States.PLAYING;
    }
}

var game = new ClientGame(socket);

function mainLoop(){
    game.loop();
    requestAnimationFrame(mainLoop);
}

mainLoop();

//to avoid default behavior using this key in the browser
window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);


