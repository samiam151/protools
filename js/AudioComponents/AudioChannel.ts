import { CONTEXT } from "./Context";
import { Channel } from "./Channel";
import { PTGainNode } from "../AudioProcessors/GainNode";
import { PTPannerNode } from "../AudioProcessors/PannerNode";
import { PTFaderMeter } from "../AudioProcessors/FaderMeter";
import { Events } from "../Helpers/Events";
import { KnobInput } from "../UIComponents/Knob";
import { KnobVisual } from "../UIComponents/KnobVisual";
import { HighPassFilter } from "../AudioProcessors/HighPass";
import { LowPassFilter } from "../AudioProcessors/LowPass"
import { BandPassFilter } from "../AudioProcessors/BandPassFilter";

export class AudioChannel extends Channel {
    public name: string;
    public id: number;
    public context: AudioContext;
    public source: MediaElementAudioSourceNode;
    public soundSource: any;
    public gain: PTGainNode;
    public pan: PTPannerNode;
    public isSterio: boolean;
    public $container: any;
    public meter: PTFaderMeter;
    public muteButton: Element;
    public soloButton: Element;
    public audioElement: HTMLAudioElement;
    public knobTemplate: string;

    public hpf: HighPassFilter;
    public lpf: LowPassFilter;
    public bpf1: BandPassFilter;
    public bpf2: BandPassFilter;

    constructor(context, soundSrc, name){
        super(context);
        this.id = (Math.round(Math.random() * 1000));
        this.audioElement = new Audio(soundSrc);
        this.audioElement.crossOrigin = "anonymous";
        this.audioElement.autoplay = false;
        this.audioElement.preload = "auto";
        this.name = name.split("/")[1].split("_")[1];
        this.$container = $("div.channel--container");
        this.source = this.context.createMediaElementSource(this.audioElement);
        this.isSterio = null;
        this.knobTemplate = KnobInput.getTemplate();
    }

    get template() {
        return $(`
            <div class="channel" data-id="${this.id}">

                <div class="eq eq__lpf">
                    <p class="eq__label">HIGHS</p>
                    <div class="eq1--freq knob-input">
                        ${this.knobTemplate}
                    </div>
                    <div class="eq1--gain knob-input">
                        ${this.knobTemplate}
                    </div>
                </div>

                <div class="eq eq__bp--1">
                    <p class="eq__label">UPPER MIDS</p>
                    <div class="eq1--freq knob-input">
                        ${this.knobTemplate}
                    </div>
                    <div class="eq1--gain knob-input">
                        ${this.knobTemplate}
                    </div>
                    <div class="eq1--q knob-input">
                        ${this.knobTemplate}
                    </div>
                </div>

                <div class="eq eq__bp--2">
                    <p class="eq__label">LOWER MIDS</p>
                    <div class="eq1--freq knob-input">
                        ${this.knobTemplate}
                    </div>
                    <div class="eq1--gain knob-input">
                        ${this.knobTemplate}
                    </div>
                    <div class="eq1--q knob-input">
                        ${this.knobTemplate}
                    </div>
                </div>

                <div class="eq eq__hpf">
                    <p class="eq__label">LOWS</p>
                    <div class="eq1--freq knob-input">
                        ${this.knobTemplate}
                    </div>
                    <div class="eq1--gain knob-input">
                        ${this.knobTemplate}
                    </div>
                </div>

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

    templateSelector(sel: string) {
        let el = document.querySelector((`[data-id="${this.id}"] ${sel}`));
        return el;
    }

    initializeTemplate() {
        this.renderTemplate();

        this.gain = new PTGainNode({
            element: this.templateSelector(".channel--gain1-range"),
            initialGain: 1
        });
        
        this.pan = new PTPannerNode({
            element: this.templateSelector("input.channel--pan-input")
        });
        
        this.meter = new PTFaderMeter({
            element: this.templateSelector("#meter--cont")
        });

        this.muteButton = document.querySelector(`[id="mm-${this.id}"]`);
        this.muteButton.addEventListener("change", e => {
            this.toggleMute(e.target['checked']);
        });

        this.soloButton = document.querySelector(`#ms-${this.id}`);
        this.soloButton.addEventListener("change", e => {
            let isOn = e.target['checked'];
            if (isOn){
                Events.emit("track/solo", {
                    trackToLeave: e.target['id'].split("-")[1]
                });
            } else {
                Events.emit("track/unsolo");
            }
        });

        // Initialize knobs
        // High Pass Filter
        let gainSettings = {
            min: -40,
            max: 40,
            initial: 0
        }
        let qSettings = {
            min: .0001,
            max: 1000,
            initial: 0
        }
        let hpfFreq = new KnobInput(this.templateSelector(".eq__hpf .eq1--freq"), {
            min: 30,
            max: 450,
            initial: 0
        });
        let hpfGain = new KnobInput(this.templateSelector(".eq__hpf .eq1--gain"), gainSettings);

        // Low pass Filter
        let lpfFreq = new KnobInput(this.templateSelector(".eq__lpf .eq1--freq"), {
            min: 5000,
            max: 20000,
            initial: 20000
        });
        let lpfGain = new KnobInput(this.templateSelector(".eq__lpf .eq1--gain"), gainSettings);
        
        // Band Pass 1
        let bp1Freq = new KnobInput(this.templateSelector(".eq__bp--1 .eq1--freq"), {
            min: 200,
            max: 2500
        });
        let bp1Gain = new KnobInput(this.templateSelector(".eq__bp--1 .eq1--gain"), gainSettings);
        let bp1Q = new KnobInput(this.templateSelector(".eq__bp--1 .eq1--q"), qSettings);

        // Band Pass 2
        let bp2Freq = new KnobInput(this.templateSelector(".eq__bp--2 .eq1--freq"), {
            min: 500,
            max: 7000
        });
        let bp2Gain = new KnobInput(this.templateSelector(".eq__bp--2 .eq1--gain"), gainSettings);
        let bp2Q = new KnobInput(this.templateSelector(".eq__bp--2 .eq1--q"), qSettings);

        // EQ Section
        // Low Pass Filter
        this.hpf = new HighPassFilter({
            frequencyElement: hpfFreq._input,
            gainElement: hpfGain._input
        });
        this.lpf = new LowPassFilter({
            frequencyElement: lpfFreq._input,
            gainElement: lpfGain._input
        });
        this.bpf1 = new BandPassFilter({
            frequencyElement: bp1Freq._input,
            gainElement: bp1Gain._input,
            qElement: bp1Q._input,
            initialFrequency: 1000,
            boundElement: bp1Freq._container
        });
        this.bpf2 = new BandPassFilter({
            frequencyElement: bp2Freq._input,
            gainElement: bp2Gain._input,
            qElement: bp2Q._input,
            initialFrequency: 3000,
            boundElement: bp2Freq._container
        });
    }

    renderTemplate() {
        this.$container.append(this.template);
    }

    startAtTime(time){
        this.initPlayback(this.source, time);
    }

    initPlayback(source, time = 0){
        source.connect(this.gain.node);
        this.gain.node.connect(this.pan.node);
        this.pan.node.connect(this.meter.node);
        this.meter.node.connect(this.lpf.node);
        this.lpf.node.connect(this.bpf1.node);
        this.bpf1.node.connect(this.bpf2.node);
        this.bpf2.node.connect(this.hpf.node);
        this.hpf.node.connect(CONTEXT.destination);

        this.audioElement.play();
        this.meter.draw();
    }

    toggleMute(mute: boolean){
        if (mute){
            this.gain.node.gain['value'] = 0;
        } else {
            this.gain.node.gain["value"] = 1;
        }
    }
}