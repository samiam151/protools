import { CONTEXT } from "../AudioComponents/Context";

export class PTPannerNode {
    public node: StereoPannerNode;
    public boundElement: Element;

    constructor(args: object){
        this.node = CONTEXT.createStereoPanner();
        this.boundElement = args['element'] ? args['element'] : null;

        if (this.boundElement){
            this.boundElement.addEventListener("input", (e) => {
                let newPanValue = e.target['value'];
                console.log(newPanValue);
                this.setPan(newPanValue);
            });
        }
    }

    setPan(value) {
        this.node.pan.value = value;
    }
}