import { CONTEXT } from "../AudioComponents/Context";

export class PTPannerNode {
    public node: PannerNode;

    constructor(){
        this.node = CONTEXT.createPanner();
    }
}