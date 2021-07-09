class Noise
{
    constructor(numberOfValues, limitValue){
        if(numberOfValues <= 0)
        {
            throw new Error("numberOfHills should greater than 0");
        }

        if(limitValue <= 0  )
        {
            throw new Error("limitValue should be greater than 0");
        }

        this.numberOfValues = numberOfValues;
        this.limitValue = limitValue;
        this.noiseValues = [];
    }

    //populates the ramdom values  
    populate(){
        while (this.noiseValues.length < this.numberOfValues) {
            var val = 0;
            while(this.noiseValues.includes(val = Math.random()*this.limitValue));
            this.noiseValues.push(val);
            // console.log(val);
        } 
    }

    getValues(){
        return this.noiseValues;
    }

    draw(){
        this.context.beginPath();
        this.context.moveTo(this.startX,this.startY);
        this.linet
    }
    

};

 module.exports = { Noise };