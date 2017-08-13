import { CONTEXT } from "../AudioComponents/Context";

export class PTGainNode {
    public node: GainNode;
    public boundElement: Element;
    
    constructor(args){
        // element, initialGain = 0
        this.node = CONTEXT.createGain();
        //this.setGain(20);
        this.boundElement = args.element ? args.element : null;
        this.boundElement.addEventListener("input", (e) => {
            console.log(e.target['value']);
            this.setGain(e.target['value']);
        });
    }

    setGain(value) {
        this.node.gain.value = value;
    }
}