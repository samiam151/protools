import { CONTEXT } from "../AudioComponents/Context";
import { Events } from "../Helpers/Events";

export class PTFaderMeter {
    public node: AnalyserNode;
    public boundElement: HTMLCanvasElement;
    public bufferLength: number;
    public canvasCtx: CanvasRenderingContext2D;

    constructor(argObj: object) {
        this.node = CONTEXT.createAnalyser();
        this.boundElement = argObj['element'] ? argObj['element'] : null;
        let index = 0; 
        
        this.node.fftSize = 2048;
        this.canvasCtx = this.boundElement.getContext("2d");
    }
    
    draw() {
        return draw.call(this);
    }
    
}

function draw(){
    let visual = requestAnimationFrame(draw.bind(this));
    var bufferLength = this.node.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    this.node.getByteFrequencyData(dataArray);
    this.canvasCtx.fillStyle = "#006600";
    let buf = null;

    // for(let i = 0; i < bufferLength; i++) {
        buf = decibal(normalize(dataArray[0]));
        this.canvasCtx.clearRect(0, 0, this.canvasCtx.canvas.width, this.canvasCtx.canvas.height);
        this.canvasCtx.fillRect(0, 0, this.canvasCtx.canvas.width, buf);
    // }
}

function decibal(num){
    return 20 * Math.log10(Math.abs(num));
}

function normalize(number){
    // return (number - 0)/(1000) * 5e+6;
    return number  * 100.0 ;
}