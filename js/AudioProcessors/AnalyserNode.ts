import { CONTEXT } from "../AudioComponents/Context";

export class PTAnalyserNode {
    public node: AnalyserNode

    constructor() {
        this.node = CONTEXT.createAnalyser();
    }
}