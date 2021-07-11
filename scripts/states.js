class States{

    constructor(){
        this.state = States.NONE;
    }

    static NONE = 0;

    // static CREATING_LEVEL = 2;
    // static CREATING_PLAYER = 3;

    static STARTING = 4;
    static PLAYING = 5;
    static FINISHING = 6;
    static FINISHED = 8;
    static WATCHING = 9;



    getState(){
        return this.state;
    }

    setState(newState)
    {
        this.state = newState;
    }

}


export {States}