import { CONTEXT } from "./Context";
import { PTGainNode } from "../AudioProcessors/GainNode";
import { PTPannerNode } from "../AudioProcessors/PannerNode";

export abstract class Channel {
    public name: string;
    public context: AudioContext;
    public id: number;

    constructor(context: AudioContext){
        this.context = context;
    }
}

// export class Channel {
//     public name: string;
//     public id: number;
//     public context: AudioContext;
//     public source: AudioBufferSourceNode;
//     public soundSource: any;
//     public gain: PTGainNode;
//     public pan: PTPannerNode;
//     public isSterio: boolean;
//     public $container: any;

//     constructor(context, soundSrc, name){
//         this.id = (Math.round(Math.random() * 1000));
//         this.name = name;
//         this.$container = $("div.channel--container");
//         this.context = context;
//         this.source = this.context.createBufferSource();
//         this.soundSource = soundSrc;

//         this.gain = new PTGainNode({
//             element: document.querySelector(`[data-id="${this.id}"].channel--gain1`),
//             initialGain: 1
//         });
//         this.pan = new PTPannerNode();
        
//         this.isSterio = null;
//     }

//     get template() {
//         return $(`
//             <div class="channel" data-id="${this.id}">
//                 <input type="range" class="channel--gain1" />
//                 <p class="channel--trackName">${this.name}</p>
//             </div>
//         `)[0];
//     }

//     renderTemplate() {
//         this.$container.append(this.template);
//     }

//     startAtTime(time){
//         this.context.decodeAudioData(this.soundSource, (audioBuffer) => {
//             console.log(audioBuffer);
//             this.isSterio = (audioBuffer.numberOfChannels > 1);
//             this.source.buffer = audioBuffer;
//             // this.source.connect(this.context.destination);
//             // this.source.start(time);
//             this.initPlayback(this.source, time);
//         });
//     }

//     initPlayback(source, time = 0){
//         source.connect(this.gain.node);
//         this.gain.node.connect(this.pan.node);
//         this.pan.node.connect(CONTEXT.destination);
//         this.source.start(time);
//     }

// }