export class Noise
{
    private numberOfValues:number;
    private limitValue:number;
    private hills:Array<any>;

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
        this.hills = [];
    }

    //populates the ramdom values  
    populate(){
        while (this.hills.length < this.numberOfValues) {
            var val = 0;
            while(this.hills.includes(val = Math.random()*this.limitValue));
            this.hills.push(val);
            console.log(val);
        } 
    }

};