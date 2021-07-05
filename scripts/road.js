export class Road
{
    constructor(numberOfHills, limitValue){
        
        if(numberOfHills <= 0)
        {
            throw new Error("numberOfHills should greater than 0");
        }

        if(limitValue <= 0  )
        {
            throw new Error("limitValue should be greater than 0");
        }

        if(limitValue < numberOfHills )
        {
            throw new Error("limitValue should be greater than numberOfHills");
        }


        this.numberOfHills = numberOfHills;
        this.limitValue = limitValue;
        this.hills = [];
    }

    //populates the ramdom values  
    populate(){
        while (this.hills.length < this.numberOfHills) {
            var val = 0;
            while(this.hills.includes(val = Math.floor(Math.random()*this.limitValue)));
            this.hills.push(val);
            console.log(val);
        } 
    }

};