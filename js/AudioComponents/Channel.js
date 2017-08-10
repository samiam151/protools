/// @ts-check
import { CONTEXT } from "./Context.js";
import { GainNode } from "../AudioProcessors/GainNode";
import { PannerNode } from "../AudioProcessors/PannerNode";
import $ from "jquery";
// import { knob } from "jquery-knob";

export class Channel {
    constructor(context, soundSrc, name){
        this.name = name;
        this.$container = $("div.channel--container");
        this.context = context;
        this.source = this.context.createBufferSource();
        this.soundSource = soundSrc;

        this.gain = new GainNode();
        this.pan = new PannerNode();
        
        this.isSterio = null;
    }

    get template() {
        return $(`
            <div class="channel">
                <p class="channel--trackName">${this.name}</p>

            </div>
        `)[0];
    }

    renderTemplate() {
        this.$container.append(this.template);
    }

    startAtTime(time){
        this.context.decodeAudioData(this.soundSource, (audioBuffer) => {
            console.log(audioBuffer);
            this.isSterio = (audioBuffer.numberOfChannels > 1);
            this.source.buffer = audioBuffer;
            // this.source.connect(this.context.destination);
            // this.source.start(time);
            this.initPlayback(this.source, time);
        });
    }

    initPlayback(source, time = 0){
        source.connect(this.gain.node);
        this.gain.node.connect(this.pan.node);
        this.pan.node.connect(CONTEXT.destination);
        this.source.start(time);
    }

}