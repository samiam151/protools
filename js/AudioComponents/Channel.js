/// @ts-check
import { CONTEXT } from "./Context.js"

export class Channel {
    constructor(context, soundSrc){
        this.context = context;
        
        this.source = this.context.createBufferSource();
        
        this.soundSource = soundSrc;
        
        // this.initPlayback();
    }

    logSource(){
        console.log(`Source: ${this.source}`);
    }

    startAtTime(time){
        this.context.decodeAudioData(this.soundSource, (audioBuffer) => {
            this.source.buffer = audioBuffer;
            this.source.connect(this.context.destination);
            this.source.start(time);
        });
    }

    // initPlayback(){
    //     this.context.decodeAudioData(this.soundSource, (audioBuffer) => {
    //         this.source.buffer = audioBuffer;
    //         this.source.connect(this.context.destination);
    //         this.source.start();
    //     });
    // }
}