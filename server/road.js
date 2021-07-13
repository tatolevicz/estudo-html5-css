const {Noise} = require("./noise.js")

class Road{
    constructor(proceduralSize, proceduralStep, roadHeight, canvasHeight){
        this.canvasHeight = canvasHeight;
        this.step = proceduralStep;
        this.noise = new Noise(proceduralSize,roadHeight);
        this.noise.populate();
        this.yValues = this.noise.getValues();
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

        //loop throughout the noise values using %
        let idxY = Math.floor(x/this.step);
        let indexY1 =  idxY % this.yValues.length;
        let indexY2 = (idxY + 1) % this.yValues.length;

        let y1 = this.yValues[indexY1];
        let y2 = this.yValues[indexY2];
    
        let normX = (x % this.step) / this.step;
        let f = this.cosInterp(normX);
        let height = this.canvasHeight - this.lerp(y1,y2,f);

        return height;
    }


    // returns the angle of to road points in rad
    getRoadAngle(x1,x2){
        let deltaX = x2 - x1;
        let deltaY = this.getRoadY(x1)- this.getRoadY(x2);
        let angle = Math.atan2(deltaY,deltaX);
        return angle;
    }
}

module.exports =  {Road};