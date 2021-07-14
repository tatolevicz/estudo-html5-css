import { States } from "./states.js";


class FrameInfo{
    constructor(){
        this.rotation =  0;
        this.rotSpeed = 0;
        this.speedY = 0;
        this.speed = 0;
        this.x = 0;
        this.y = 0;
    }
}

class Player{
    constructor(scale, stickWithCamera){

        this.nextFrameInfo = new FrameInfo();
        this.frameInterp = 0;

        this.controlSpeed = 0;
        this.controlRotation = 0;
        this.state = new States();

        this.scale = scale;
        this.rotation = 0;
        this.rotSpeed = 0.0;

        this.speedY = 0;
        this.gravity = 0.2;

        this.speed = 0;
        
        this.x = 0;
        this.y = 0;

        this.playerOffsetX = 200;

        this.grounded = false;
        this.lastGroundedState = false;

        this.onGrounded = undefined;
        this.onPlayerReady = undefined;

        this.shouldStickWithCamera = stickWithCamera;

        this.img = new Image();

        this.img.onload = () => {
            this.width = this.img.width*this.scale;
            this.height = this.img.height*this.scale;
            this.y = -this.height;
            if(this.onPlayerReady)
                this.onPlayerReady(this)
        };

        this.img.src = './assets/images/player.png';
    }

    draw(){

        var canvas = document.querySelector("canvas");
        var ctx = canvas.getContext("2d");        

        ctx.save();

        let x = this.shouldStickWithCamera ? this.playerOffsetX : this.x + this.playerOffsetX; 
        ctx.translate(x,this.y - this.height/2);
        ctx.rotate(this.rotation);

        ctx.translate(0,this.height/2);
        ctx.drawImage(this.img,-this.width/2, -this.height, this.width ,this.height);

        ctx.restore();
    }

    setScale(scale){
        this.scale = scale;
        this.width = this.img.width*this.scale;
        this.height = this.img.width*this.scale;
    }

    setPositionY(y){

        if(this.y < (y - 10))
        {
            this.grounded = false;

            this.rotation += 0.01;
        }
        else{
            this.grounded = true;
        }

         //just change the state
        if(this.lastGroundedState != this.grounded)
        {
            // console.log("Grounded: " + this.grounded);
            if(this.grounded && this.onGrounded)
                this.onGrounded(this);
        }
    
        this.lastGroundedState = this.grounded;

        if(this.y < y)
        {
            this.speedY += this.gravity;
        }
        else{
            this.speedY -= (this.y - y) *this.gravity*5;
            this.y = y;
        }
        
        this.x += this.speed;
        this.y += this.speedY;
    }

    rotate(increment){
        this.rotation -= increment*this.rotSpeed;

        if(this.rotation > Math.PI) this.rotation = -Math.PI;
        if(this.rotation < -Math.PI) this.rotation = Math.PI;
    }

    setSpeed(speed){
        this.speed = Math.abs(speed);
    }

    isGrounded(){
        return this.grounded;
    }

    // update(dt){
    //     //do the game logic
    //     switch (this.state.getState()) {
    //         case States.STARTING:

    //             if(this.grounded) {
    //                 this.state.setState(States.PLAYING)
    //                 break;
    //             }
        
    //             this.updateToNextFrame(this.player,dt);
    //             this.enemys.forEach(enemy => {
    //                 this.updateToNextFrame(enemy,dt);
    //             }); 

    //             break;
    //         case States.PLAYING: 
    //             this.updateToNextFrame(this.player,dt);
    //             this.enemys.forEach(enemy => {
    //                 this.updateToNextFrame(enemy,dt);
    //             });

    //             break;
    //         case States.FINISHING: 

    //             this.player.playerOffsetX -= 5
    //             this.player.rotation -= Math.PI * 0.2;

    //             this.player.speed -= this.player.speed*this.gameAcceleration*3;

    //             this.updatePlayerPosition(this.player);

    //             if(this.player.speed <= 0.05){
    //                 this.states.setState(States.FINISHED);
    //             }

    //             break;
    //         case States.FINISHED: 
    //                 this.player.speed = 0;
    //                 this.player.playerOffsetX = this.canvas.width/4;
    //                 this.player.x = this.road.currentX;
    //                 this.uiContainer.setAttribute("style","display: flex !important");
    //                 this.player.rotation = 0;
    //                 this.player.y = -this.player.height;
    //                 this.states.setState(States.NONE);
    //             break;
    //         case States.NONE: 
    //             this.enemys.forEach(enemy => {
    //                 this.updateToNextFrame(enemy,dt);
    //             });
    //             break
    //         default:
    //             break;
    //     }

        // if(this.player && this.player.shouldStickWithCamera)
        // {
        //     this.road.currentX = this.player.x;
        //     this.sky.currentX = this.player.x;
        // }
    // }
}

export {Player, FrameInfo};