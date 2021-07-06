import { Entity } from "../utils";

export class Game extends Entity{
    private _lastTimestamp = 0;

    public Entities:Entity[] = [];

    public Awake(): void{
        super.Awake();

          // awake all children
        for (const entity of this.Entities){
            entity.Awake()
        }

        // Make sure Update starts after all entities are awake
        window.requestAnimationFrame(() => {
            // set initial timestamp
            this._lastTimestamp = Date.now()
            // start update loop
            this.Update()
        });
    }

    public Update() : void {
        const timestamp = Date.now();
        const deltaTime = (timestamp - this._lastTimestamp)/1000;

        super.Update(deltaTime);

        // update all children
        for (const entity of this.Entities){
            entity.Update(deltaTime)
        }

        this._lastTimestamp = timestamp;
        window.requestAnimationFrame(() => this.Update());
    }
}