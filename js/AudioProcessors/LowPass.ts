import { CONTEXT } from "../AudioComponents/Context";
import { IBoundAudioProcessor } from "./IBoundAudioProcessor";

export class LowPassFilter implements IBoundAudioProcessor {
    public node: BiquadFilterNode;
    public boundElement: Element;
    
    constructor(args){
        this.node = CONTEXT.createBiquadFilter();
        this.node.type = "lowpass";
        this.node.frequency.value = args.freq ? args.freq : 15000;
        this.node.gain.value = args.gain ? args.gain : 1;
        this.boundElement = args.element ? args.element : null;
    }
}