import { Noise } from "./utils/noise.js";

class Road{
    constructor(context, startX, endX ,startY, endY, proceduralSize, proceduralStep, height ,interpolationAmount, color){

        this.startY = startY;
        this.endY = endY;
        this.startX = startX;
        this.endX = endX;
        this.context = context;
        this.color = color;
        this.step = proceduralStep;

        this.interpolationAmount = interpolationAmount;

        this.noise = new Noise(proceduralSize,height);
        this.noise.populate();
    }

    draw(){
        
        //just to auto complete for now
        var canvas = document.querySelector("canvas");
        var ctx = canvas.getContext("2d");    

        ctx.beginPath();
        ctx.moveTo(this.startX,this.startY);

        let yValues = this.noise.getValues();

        for(var i = 0; i < canvas.width; i++){    
            ctx.lineTo(i*this.step,canvas.height - Math.round(yValues[i % yValues.length]));

            if(i*this.step > canvas.width)
                break;
        }

        ctx.lineTo(this.endX,this.endY);
        ctx.strokeStyle = this.color;
        ctx.stroke();

        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

export { Road };