import { IAwake , IUpdate} from "../lifecycle/lifecycle.h";
import { Entity } from "./entity";

export interface IComponent extends IAwake,IUpdate{
    Entity: Entity | null;
};