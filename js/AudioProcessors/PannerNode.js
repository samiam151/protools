import { CONTEXT } from "../AudioComponents/Context";

export class PannerNode {
    constructor(){
        console.log(CONTEXT);
        this.node = CONTEXT.createPanner();
    }
}