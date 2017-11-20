import { CONTEXT } from "../AudioComponents/Context";


export class BandPassFilter {
    public node: BiquadFilterNode;
    // private boundElement: Element;
    private frequencyElement: Element;
    private gainElement: Element;
    private qElement: Element;
    private indicator: Element;
    private element: Element;
    private indicatorElement: Element;
    
    constructor(args){
        this.node = CONTEXT.createBiquadFilter();
        this.node.type = "peaking";
        this.element = args.boundElement;
        this.node.frequency.value = args.initialFrequency ? args.initialFrequency : 60;
        // this.boundElement = args.element ? args.element : null;
        this.frequencyElement = args.frequencyElement ? args.frequencyElement : null;
        this.gainElement = args.gainElement ? args.gainElement : null;
        this.node.gain.value = 0;
        this.qElement =  args.qElement; 
        this.indicatorElement = this.element.querySelector(".indicator--span");

        this.frequencyElement.addEventListener("change", (e) => {
            this.setFrequency(e.target['value']);
        });

        this.gainElement.addEventListener("change", (e) => {
            this.setGain(e.target['value']);
        });

        this.qElement.addEventListener("change", (e) => {
            this.setQ(e.target['value']);
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

    setQ(value: number) {
        this.node.Q.value = value;
        console.log(this.node.gain.value);
    }
 }