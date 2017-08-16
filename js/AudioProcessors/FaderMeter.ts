import { CONTEXT } from "../AudioComponents/Context";
import { Events } from "../Helpers/Events";

export class PTFaderMeter {
    public node: ScriptProcessorNode;
    public boundElement: Element;

    constructor(argObj: object) {
        this.node = CONTEXT.createScriptProcessor(4096, 2, 2);
        this.boundElement = argObj['element'] ? argObj['element'] : null;
        console.log(this.boundElement);
        let index = 0; 
        
        this.node.onaudioprocess = (event: AudioProcessingEvent) => {
            processAudio(index, event, this.boundElement); 
            index++;    
        }

        
        
        Events.subscribe("sample/update", e => {
            let sample = e.sample;
            if (index % 20) console.log(sample);
        });
        
    }
    
}

function processAudio(index: number, event, element) {
    // console.log(event);  
    var inputBuffer: AudioBuffer = event.inputBuffer;
    
    // The output buffer contains the samples that will be modified and played
    var outputBuffer: AudioBuffer = event.outputBuffer;
    
    let amplitude = 0;
    
    // Loop through the output channels
    for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
        var inputData = inputBuffer.getChannelData(channel);
        var outputData = outputBuffer.getChannelData(channel);
        
        
        // Loop through the 4096 samples
        for (var sample = 0; sample < inputBuffer.length; sample++) {
            // window.requestAnimationFrame(proc) 
            if (index % 3 === 0) proc(inputData[sample], element);
            
           
            // make output equal to the same as the input
            outputData[sample] = inputData[sample];
        }
    }
}

function proc(sample, element){
    
    let amplitude = Math.abs(sample);
    
    if (element) {
        element.style.height = decibal(normalize(amplitude)) + "px";
        // window.requestAnimationFrame(proc)
    }
}

function decibal(num){
    return 20 * Math.log10(Math.abs(num));
}

function normalize(number){
    return (number - 0)/(1000) * 1e+6;
}