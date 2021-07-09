
class Player{


    constructor(img, scale, id){
        this.id = id;
        this.img = img;
        this.scale = scale;
        this.rotation = 0;
        this.rotSpeed = 0.0;

        this.speedY = 0;
        this.gravity = 0.2;

        this.speed = 1;

        this.img = new Image();

        this.img.onload = () => {   
            this.width = this.img.width*this.scale;
            this.height = this.img.height*this.scale;
        }

        this.img.src = './assets/images/player.png';
        
        this.x = 0;
        this.y = 0;

        this.grounded = false;
        this.lastGroundedState = false;

        this.onGrounded = undefined;
    }

    draw(){

        var canvas = document.querySelector("canvas");
        var ctx = canvas.getContext("2d");        

        ctx.save();

        ctx.translate(this.x,this.y - this.height/2);
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

    setPosition(x,y){

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
                this.onGrounded();
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
}

export {Player};