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
        
        // var canvas = this.boundElement;
        
        

        // this.node.onaudioprocess = (event: AudioProcessingEvent) => {
        //     var inputBuffer: AudioBuffer = event.inputBuffer;
        //     var outputBuffer: AudioBuffer = event.outputBuffer;
            
        //     for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
        //         var inputData = inputBuffer.getChannelData(channel);
        //         var outputData = outputBuffer.getChannelData(channel);

        //         for (var sample = 0; sample < inputBuffer.length; sample++) {
        //             if (index % 9 === 0) {
        //                 outputData[sample] = proc.apply(this, [inputData[sample]]);
        //             } else {
        //                 outputData[sample] = inputData[sample];
        //             }
        //         }
        //     }
        //     index++;    
        // }

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
    this.canvasCtx.fillStyle = "#660000";

    // for(var i = 0; i < bufferLength; i++) {
        this.canvasCtx.clearRect(0,0, this.canvasCtx.canvas.width, this.canvasCtx.canvas.height);
        this.canvasCtx.fillRect(0, 0, this.canvasCtx.canvas.width, decibal(normalize(dataArray[0])));
    //   }
}


function decibal(num){
    return 20 * Math.log10(Math.abs(num));
}

function normalize(number){
    // return (number - 0)/(1000) * 5e+6;
    return number  * 1e+3 ;
}
// var globalElement = null;
// var globalSample = null;
// function processAudio(index: number, event, element) {
//     var inputBuffer: AudioBuffer = event.inputBuffer;
//     var outputBuffer: AudioBuffer = event.outputBuffer;
    
//     let amplitude = 0;
//     for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
//         var inputData = inputBuffer.getChannelData(channel);
//         var outputData = outputBuffer.getChannelData(channel);

//         for (var sample = 0; sample < inputBuffer.length; sample++) {
//             globalSample = inputData[sample];
//             if (index % 8 === 0) proc.call(this, inputData[sample]);
//             outputData[sample] = inputData[sample];
//         }
//     }
// }
