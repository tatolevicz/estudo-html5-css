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


class Game{
    constructor() {

        this.states = new States();
        // step 1
        this.canvas = document.querySelector("canvas");
        this.context = this.canvas.getContext("2d");

        //step 2
        this.canvas.width = window.innerWidth * 0.8 < 1000 ? window.innerWidth * 0.8 : 1000;
        this.canvas.height = 500;
        this.gameSpeed = 0;
        this.gameAcceleration = 0.01;

        this.inputHandler = new InputHandler();

        this.playerOffsetX = this.canvas.width/4;

        // step 3 and 4
        this.road = new Road(
            this.canvas, 
            0, 
            this.canvas.width*1.1, 
            this.canvas.height, 
            this.canvas.height, 
            50,
            180, 
            160, 
            GameColors.hillsColor,
            true,
            false,
            3.0);  
            
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

            let img = new Image();
            img.src = './assets/images/player.png';

            this.player = new Player(img,0.7);

            this.player.onGrounded = this.onPlayerGrounded;

            window.onkeydown = ev => this.inputHandler.controls[ev.key] = 1;
            window.onkeyup = ev => this.inputHandler.controls[ev.key] = 0;
    }

    onPlayerGrounded()
    {
        console.log("Player grounded");
    }

    loop(){

        //get the inputs from user
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
        this.sky.draw();

        //draw the road and player with any sequence cause they will not overlap each other
        this.road.draw();
        this.player.draw();
    }

    update(){

        //do the game logic
        switch (this.states.getState()) {
            case States.STARTING:
                this.states.setState(States.PLAYING);
                break;
            case States.PLAYING: 
                this.sky.setSpeed(this.gameSpeed);
                this.road.setSpeed(this.gameSpeed);
                this.player.setSpeed(this.gameSpeed);
                break;
            case States.FINISHING: 
                break;
            case States.FINISHED: 
                break;
            case States.NONE: 
                if(this.player.grounded)
                {
                    this.states.setState(States.STARTING)
                }
            default:
                break;
        }

        //update the position and rotation of player
        this.updatePlayerPosition();
        this.updatePlayerRotation();
    }

    checkGameOver()
    {

    }
    

    updatePlayerPosition()
    {
        let playerX = this.playerOffsetX;
        let playerY = this.road.getRoadY(this.road.getRoadPosition(playerX));
        this.player.setPosition(playerX,playerY);
    }


    updatePlayerRotation()
    {
        let roadAngle= this.road.getRoadAngle(this.road.getRoadPosition(this.playerOffsetX) - this.player.width/3,this.road.getRoadPosition(this.playerOffsetX) + this.player.width/3);

        if(this.player.grounded){
            this.player.rotSpeed = 0.3;
            this.player.rotate(this.player.rotation + roadAngle);
        }
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
            this.gameSpeed -=  this.gameSpeed*this.gameAcceleration - gravityAcelleration;
        }



        let rotDirection = (this.inputHandler.controls.ArrowLeft - this.inputHandler.controls.ArrowRight);
        
        this.player.rotSpeed = 0.1;
        this.player.rotate(rotDirection);

    }
}

var game = new Game();

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


