import { CONTEXT } from "../AudioComponents/Context";
import { ILimitFilter } from "./ILimitFilter";


export class LowPassFilter implements ILimitFilter {
    public node: BiquadFilterNode;
    // public boundElement: Element;
    public frequencyElement: Element;
    public gainElement: Element;
    
    constructor(args){
        this.node = CONTEXT.createBiquadFilter();
        this.node.type = "lowpass";
        this.node.frequency.value = 20000;
        // this.boundElement = args.element ? args.element : null;
        this.frequencyElement = args.frequencyElement ? args.frequencyElement : null;
        this.gainElement = args.gainElement ? args.gainElement : null;

        this.frequencyElement.addEventListener("change", (e) => {
            this.setFrequency(e.target['value']);
        });

        this.gainElement.addEventListener("change", (e) => {
            this.setGain(e.target['value']);
        });
    }

    setFrequency(value: number) {
        this.node.frequency.value = value;
        console.log(this.node.frequency.value);
    }

    setGain(value: number) {
        this.node.gain.value = value;
        console.log(this.node.gain.value);
    }
 }