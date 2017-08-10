import { CONTEXT } from "../AudioComponents/Context";

export class AnalyserNode {
    constructor() {
        this.node = CONTEXT.createAnalyser();
    }
}