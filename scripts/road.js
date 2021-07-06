import { Noise } from "./utils/noise.js";

class Road{
    constructor(context, startX, endX ,startY, endY, proceduralSize, height ,interpolationAmount){

        this.startY = startY;
        this.endY = endY;
        this.startX = startX;
        this.endX = endX;
        this.context = context;

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

        let step = Math.floor(canvas.width/yValues.length);

        console.log(step);

        for(var i = 0; i < canvas.width; i++){    
            ctx.lineTo(i*step,canvas.height - Math.round(yValues[i % yValues.length]));

            if(i*step > canvas.width)
                break;
        }


        ctx.strokeStyle = "#000";
        ctx.stroke();
    }
}

export { Road };