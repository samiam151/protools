import { CONTEXT } from "./Context.js"

export class Channel {
    constructor(context, soundSrc){
        this.context = context;
        this.source = soundSrc;
    }

    logSource(){
        console.log(`Source: ${this.source}`);
    }

    initPlayback(){
        
    }
}