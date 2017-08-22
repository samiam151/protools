import { CONTEXT } from "./Context";
import { Channel } from "./Channel";
import { PTGainNode } from "../AudioProcessors/GainNode";
import { PTPannerNode } from "../AudioProcessors/PannerNode";
import { PTFaderMeter } from "../AudioProcessors/FaderMeter";
import { Events } from "../Helpers/Events";

export class AudioChannel extends Channel {
    public name: string;
    public id: number;
    public context: AudioContext;
    public source: AudioBufferSourceNode;
    public soundSource: any;
    public gain: PTGainNode;
    public pan: PTPannerNode;
    public isSterio: boolean;
    public $container: any;
    public meter: PTFaderMeter;
    public muteButton: Element;
    public soloButton: Element;

    constructor(context, soundSrc, name){
        super(context);
        this.id = (Math.round(Math.random() * 1000));
        this.name = name;
        this.$container = $("div.channel--container");
        this.source = this.context.createBufferSource();
        this.soundSource = soundSrc;

        // this.$container.append(this.template)    
        
        this.isSterio = null;
    }

    get template() {
        return $(`
            <div class="channel" data-id="${this.id}">
                <div class="channel--fader">
                    <div class="channel--gain1">
                        <input type="range" class="channel--gain1-range" min="0" max="5" step="0.01" value="1"/>
                        <span class="channel--gain1-indicator"></span>
                    </div>
                    <div class="meter">
                        <canvas id="meter--cont" height="133" width="10"></canvas>
                    </div>
                </div>
                <div class="channel--pan1">
                    <input class="channel--pan-input" type="number" min="-1" max="1" step="0.1" defualtValue="0" />
                </div>

                <div class="isolation--cont">
                    <input class="tgl tgl-skewed" data-forMethond="solo" id="ms-${this.id}" type="checkbox"/>
                    <label class="tgl-btn" data-tg-off="S" data-tg-on="S" for="ms-${this.id}"></label>

                    <input class="tgl tgl-skewed" data-forMethond="mute" id="mm-${this.id}" type="checkbox"/>
                    <label class="tgl-btn" data-tg-off="M" data-tg-on="M" for="mm-${this.id}"></label>
                </div>

                <p class="channel--trackName">${this.name}</p>
            </div>
        `)[0];
    }

    getLevelState() {
        return {
            gain1: this.gain.node.gain.value,
            pan: this.pan.node.pan.value
        }
    }

    initializeTemplate() {
        this.renderTemplate();
        this.gain = new PTGainNode({
            element: document.querySelector(`[data-id="${this.id}"] .channel--gain1-range`),
            initialGain: 1
        });

        this.pan = new PTPannerNode({
            element: document.querySelector(`[data-id="${this.id}"] input.channel--pan-input`)
        });

        this.meter = new PTFaderMeter({
            element: document.querySelector(`[data-id="${this.id}"] #meter--cont`)
        });

        this.muteButton = document.querySelector(`[id="mm-${this.id}"]`);
        this.muteButton.addEventListener("change", e => {
            console.log(e.target['checked']);
            e.target['checked'] ? this.gain.node.gain['value'] = 0 : this.gain.node.gain["value"] = 1;
        });

        this.soloButton = document.querySelector(`#ms-${this.id}`);
        this.soloButton.addEventListener("change", e => {
            Events.emit("solo", {

            });
        });
    }

    renderTemplate() {
        this.$container.append(this.template);
    }

    startAtTime(time){
        this.context.decodeAudioData(this.soundSource, (audioBuffer) => {
            // this.isSterio = (audioBuffer.numberOfChannels > 1);
            this.source.buffer = audioBuffer;
            this.initPlayback(this.source, time);
        });
    }

    initPlayback(source, time = 0){
        source.connect(this.gain.node);
        this.gain.node.connect(this.pan.node);
        this.pan.node.connect(this.meter.node);
        this.meter.node.connect(CONTEXT.destination);
        this.source.start(time);

        this.meter.draw();
    }
}