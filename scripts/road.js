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

        this.sizeRoadInPixels = this.proceduralSize*this.step;
    }

    draw(){
        //just to auto complete for now
        var canvas = document.querySelector("canvas");
        var ctx = canvas.getContext("2d");    

        ctx.beginPath();
        ctx.moveTo(this.startX,this.startY);

        let i = 0;
        while(i < this.endX){
            //get x of line segment
            // let x1 = i;
            // let x2 = i + this.step;

            // let shouldBreak = false;

            //check x limits
            // if(x2 > this.endX){
                // x2 = this.endX;
                // shouldBreak = true;
            // }

            // let y1 = canvas.height - Math.round(yValues[(this.indexNoise) % this.yValues.length]);
            // let y2 = canvas.height - Math.round(yValues[(this.indexNoise + 1) % this.yValues.length]);
            
            // this.indexNoise += 1;

            // let y = y1;

            // let x = x1;

            // let dist = x2 - x1; 

            //interpolate to build the hill in this segment
            // while(x <= x2)
            // {
            //     let deltaX = x2 - x;
            //     let factor = (1 - deltaX/dist);

            //     y = this.lerp(y1, y2,this.cosInterp(factor));

            //     ctx.lineTo(x,y);
            //     x += 1;
            // }

            // i = x2;

            // if(shouldBreak){
                // break;
            // }

            ctx.lineTo(i,this.getRoadY(i));
            i++;
        }

        ctx.lineTo(this.endX,this.endY);
        ctx.strokeStyle = this.color;
        ctx.stroke();

        ctx.fillStyle = this.color;
        ctx.fill();
    }

    // f should be a number between 0 - 1
    lerp(a,b,f)
    {
        return a + (b - a) * f;
    }

    // v should be a number between 0 - 1
    cosInterp(v){
        return (1 - Math.cos (v * Math.PI))/2;
    }

    getRoadY(x)
    {
        if (x < 0 || x > this.sizeRoadInPixels)
        {
            console.log("road position invalid");
            return;
        }
        
        //loop throughout the noise values
        let idxY = Math.floor(x/this.step);
        let indexY1 =  idxY % this.yValues.length;
        let indexY2 = (idxY + 1) % this.yValues.length;

        let y1 = this.yValues[indexY1];
        let y2 = this.yValues[indexY2];
    
        let v = (x % this.step) / this.step;
        
        console.log('Val: ' + this.lerp(y1,y2,this.cosInterp(v)));

        let height = this.canvas.height - this.lerp(y1,y2,this.cosInterp(v));

        console.log('Height: ' + height);

        return height;
    }
}

export { Road };