import { CONTEXT } from "../AudioComponents/Context";


export class BandPassFilter {
    public node: BiquadFilterNode;
    // public boundElement: Element;
    public frequencyElement: Element;
    public gainElement: Element;
    public qElement: Element;
    
    constructor(args){
        this.node = CONTEXT.createBiquadFilter();
        this.node.type = "peaking";
        this.node.frequency.value = args.freq ? args.freq : 60;
        // this.boundElement = args.element ? args.element : null;
        this.frequencyElement = args.frequencyElement ? args.frequencyElement : null;
        this.gainElement = args.gainElement ? args.gainElement : null;
        this.qElement =  args.qElement; 

        this.frequencyElement.addEventListener("change", (e) => {
            this.setFrequency(e.target['value']);
        });

        this.gainElement.addEventListener("change", (e) => {
            this.setGain(e.target['value']);
        });

        this.qElement.addEventListener("change", (e) => {
            this.setFrequency(e.target['value']);
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