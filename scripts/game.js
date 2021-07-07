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
import { GameColors } from "./colors.js";


class Game{
    constructor() {
        // step 1
        this.canvas = document.querySelector("canvas");
        this.context = this.canvas.getContext("2d");

        //step 2
        this.canvas.width = window.innerWidth * 0.8 < 1000 ? window.innerWidth * 0.8 : 1000;
        this.canvas.height = 500;

        // step 3 and 4
        this.road = new Road(
            this.canvas, 
            0, 
            this.canvas.width*1.1, 
            this.canvas.height, 
            this.canvas.height, 
            250,
            80, 
            130, 
            GameColors.hillsColor,
            true,
            false,
            1.0);  
            
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
            0.3);
    }

    loop(){
        // console.log("Running loop!");
        this.draw();
    }

    draw(){
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.context.fillStyle = GameColors.backgroundColor;
        this.context.fillRect(0,0,this.canvas.width, this.canvas.height);

        this.sky.draw();
        this.road.draw();
        // console.log(this.road.getRoadAngle(0,80)*(180/Math.PI));
    }
}

var game = new Game();

function mainLoop(){
    game.loop();
    requestAnimationFrame(mainLoop);
}

mainLoop();

