import { IAwake , IUpdate} from "../lifecycle/lifecycle.h";
import { IComponent } from "./component.h";

type constr<T> = { new(...args: unknown[]): T };

export abstract class Entity implements IAwake, IUpdate {
    
    public Awake(): void {
    for (const component of this._components) {
            component.Awake();
        }
    }

    public Update(deltaTime: number): void{
        for (const component of this._components) {
            component.Update(deltaTime);
        }
    }

    protected _components: IComponent[] = [];

    public get Components(): IComponent[] {
        return this._components;
    }

    public AddComponent(component:IComponent): void
    {
        this._components.push(component);
        component.Entity = this;
    }

    public GetComponent<C extends IComponent>(constr: constr<C>): C { 

        for (const component of this._components) {
            if (component instanceof constr){
                return component as C;
            }
        }

        throw new Error("Component not found on Entity");
    }

    public RemoveComponent<C extends IComponent>(constr: constr<C>): void { 

        let toRemove: IComponent | undefined;
        let index: number | undefined;

        for (let i = 0; i < this._components.length; i++) {
            if (this._components[i] instanceof constr){
                toRemove = this._components[i];
                index = i;
                break;
            }
        }

    
        if (toRemove && index) {
            toRemove.Entity = null
            this._components.splice(index, 1)
        }

        throw new Error("Component not found on Entity");
    }

    public HasComponent<C extends IComponent>(constr: constr<C>): boolean { 

        for (const component of this._components) {
            if (component instanceof constr){
                return true;
            }
        }

        return false;
    }

}