import { CONTEXT } from "./Context";

export abstract class Channel {
    public name: string;
    public context: AudioContext;
    public id: number;

    constructor(context: AudioContext){
        this.context = context;
    }
}
