import { Noise } from "./utils/noise.js";

class Road{
    constructor(canvas, startX, endX ,startY, endY, proceduralSize, proceduralStep, height , color){

        this.startY = startY;
        this.endY = endY;
        this.startX = startX;
        this.endX = endX;

        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");

        this.color = color;
        this.step = proceduralStep;
        
        this.noise = new Noise(proceduralSize,height);
        this.noise.populate();
        this.yValues = this.noise.getValues();

        this.indexNoise = 0;

        this.speed = 0;
        this.pixelsToMove = 0;
    }

    draw(){
        //just to auto complete for now
        var canvas = document.querySelector("canvas");
        var ctx = canvas.getContext("2d");    

        ctx.beginPath();
        ctx.moveTo(this.startX,this.startY);

        let i = 0;
        while(i < this.endX){

            let x = i + this.pixelsToMove;
            let y = this.getRoadY(x);

            ctx.lineTo(i,y);
            i++;
        }

        ctx.lineTo(this.endX,this.endY);
        ctx.strokeStyle = this.color;
        ctx.stroke();

        ctx.fillStyle = this.color;
        ctx.fill();

        this.pixelsToMove += this.speed;
    }

    // f should be a number between 0 - 1
    lerp(a,b,f)
    {
        return a + (b - a) * f;
    }

    cosInterp(v){
        return (1 - Math.cos (v * Math.PI))/2;
    }

    getRoadY(x)
    {
        //revert the draw of road 
        if (x < 0){
            x =  Math.abs(x); 
        }
        
        //loop throughout the noise values
        let idxY = Math.floor(x/this.step);
        let indexY1 =  idxY % this.yValues.length;
        let indexY2 = (idxY + 1) % this.yValues.length;

        let y1 = this.yValues[indexY1];
        let y2 = this.yValues[indexY2];
    
        let normX = (x % this.step) / this.step;
        let height = this.canvas.height - this.lerp(y1,y2,this.cosInterp(normX));

        return height;
    }

    // returns the angle of to road points in rad
    getRoadAngle(x1,x2){
        let deltaX = x2 - x1;
        let deltaY = this.getRoadY(x1)- this.getRoadY(x2);
        let angle = Math.atan2(deltaY,deltaX);
        return angle;
    }

    setSpeed(speed)
    {
        this.speed = speed;
    }
}

export { Road };