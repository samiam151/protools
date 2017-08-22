import { CONTEXT } from "../AudioComponents/Context";
import { IBoundAudioProcessor } from "./IBoundAudioProcessor";

export class PTGainNode implements IBoundAudioProcessor {
    public node: GainNode;
    public boundElement: Element;
    public previousGain: number;
    
    constructor(args){
        // element, initialGain = 0
        this.node = CONTEXT.createGain();
        //this.setGain(20);
        this.boundElement = args.element ? args.element : null;
        this.boundElement.addEventListener("input", (e) => {
            this.setGain(e.target['value']);
            this.previousGain = e.target['value'];
        });
    }

    setGain(value) {
        this.node.gain.value = value;  // the default value is 1. a value of 0 will mute the channel
    }
}