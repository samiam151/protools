import { CONTEXT } from "../AudioComponents/Context";
import { Events } from "../Helpers/Events";

export class PTFaderMeter {
    public node: ScriptProcessorNode;
    public boundElement: Element;

    constructor(argObj: object) {
        this.node = CONTEXT.createScriptProcessor(2048, 2, 2);
        this.boundElement = argObj['element'] ? argObj['element'] : null;
        let index = 0; 
        
        this.node.onaudioprocess = (event: AudioProcessingEvent) => {
            var inputBuffer: AudioBuffer = event.inputBuffer;
            var outputBuffer: AudioBuffer = event.outputBuffer;
            
            for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
                var inputData = inputBuffer.getChannelData(channel);
                var outputData = outputBuffer.getChannelData(channel);

                for (var sample = 0; sample < inputBuffer.length; sample++) {
                    if (index % 9 === 0) {
                        outputData[sample] = proc.apply(this, [inputData[sample]]);
                    } else {
                        outputData[sample] = inputData[sample];
                    }
                }
            }
            index++;    
        }
    }
    
}

function proc(sample){
    if (this.boundElement) {
        this.boundElement.style.height = decibal(sample) + "px";
    }
    return sample;
}

function decibal(num){
    return 20 * Math.log10(Math.abs(num * 3e+6));
}

function normalize(number){
    // return (number - 0)/(1000) * 5e+6;
    return number ;
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
