import { CONTEXT } from "../AudioComponents/Context";

export class GainNode {
    constructor(initialGain = 0){
        this.node = CONTEXT.createGain();
        //this.setGain(20);
    }

    setGain(value) {
        this.node.gain.value = value;
    }
}