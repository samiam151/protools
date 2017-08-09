/// @ts-check
import { CONTEXT } from "./Context.js"

export class Channel {
    constructor(context, soundSrc){
        this.context = context;
        this.source = this.context.createBufferSource();
        this.soundSource = soundSrc;   
        
        this.isSterio = null;
    }

    logSource(){
        console.log(`Source: ${this.source}`);
    }

    startAtTime(time){
        this.context.decodeAudioData(this.soundSource, (audioBuffer) => {
            console.log(audioBuffer);
            this.isSterio = (audioBuffer.numberOfChannels > 1);
            this.source.buffer = audioBuffer;
            this.source.connect(this.context.destination);
            this.source.start(time);
        });
    }

    get template() {
        return 5;
    }
}