
class Player{


    constructor(img, scale){
        
        this.img = img;
        this.scale = scale;
        this.rotation = 0;
        
        this.width = this.img.width*this.scale;
        this.height = this.img.height*this.scale;

        this.x = 0;
        this.y = 0;

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
        this.x = x;
        this.y = y;
    }

    setRotation(rad){
        this.rotation = -rad;
    }

}

export {Player};