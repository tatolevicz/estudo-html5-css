class States{

    constructor(){
        this.state = States.NONE;
    }

    static NONE = 0;
    static STARTING = 1;
    static PLAYING = 2;
    static FINISHING = 3;
    static FINISHED = 4;
    static WAITING_SERVER = 5;


    getState(){
        return this.state;
    }

    setState(newState)
    {
        this.state = newState;
    }

}


export {States}