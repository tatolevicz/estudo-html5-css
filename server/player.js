class Player{
    constructor(socket){
        
        this.socket = socket;
        this.controlSpeed = 0;
        this.controlRotation = 0;
        this.worldPositionX = 0;

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
}

module.exports = {Player};