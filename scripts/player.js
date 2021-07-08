
class Player{


    constructor(img, scale){
        
        this.img = img;
        this.scale = scale;
        this.rotation = 0;
        this.rotSpeed = 0.3;

        this.speedY = 0;
        this.gravity = 0.2;

        this.speed = 1;
        
        this.width = this.img.width*this.scale;
        this.height = this.img.height*this.scale;

        this.x = 0;
        this.y = 0;

        this.grounded = false;
        this.lastGroundedState = false;


        this.img = new Image();
        this.img.src = './assets/images/player.png';
    }

    draw(){

        var canvas = document.querySelector("canvas");
        var ctx = canvas.getContext("2d");        

        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(this.rotation);

        ctx.drawImage(this.img,-this.width/2, -this.height, this.width ,this.height);
        ctx.restore();
    }

    setScale(scale){
        this.scale = scale;
        this.width = this.img.width*this.scale;
        this.height = this.img.width*this.scale;
    }

    setPosition(x,y){


        if(this.y < (y - 10))
        {
            this.grounded = false;
        }
        else{
            this.grounded = true;
        }

        if(this.lastGroundedState != this.grounded)
        {
            console.log("Grounded: " + this.grounded);
        }
    
        this.lastGroundedState  = this.grounded;

        if(this.y < y)
        {
            this.speedY += this.gravity;
        }
        else{
            this.speedY -= (this.y - y) * this.speed*this.gravity;
            this.y = y;
        }
        
        this.x = x;
        // console.log(this.speedY);
        this.y += this.speedY;
    }

    setRotation(rad){
        this.rotation -= (this.rotation + rad)*this.rotSpeed;
    }

    setSpeed(speed){
        this.speed = Math.abs(speed);
    }

    isGrounded(){
        return this.grounded;
    }
}

export {Player};