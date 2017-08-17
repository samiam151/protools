import axios from "axios";
import { CONTEXT } from "./AudioComponents/Context";
import { AudioChannel } from "./AudioComponents/AudioChannel";
import { Stems } from "./Helpers/Stems";
import { SoundBank } from "./AudioComponents/SoundBank";
import { ChannelList } from "./AudioComponents/ChannelList";

"use strict";

window.onload = function(){
    init();
    
}

function init(){
    let initialChannelList = new ChannelList();
    let stems = Stems.map(stem => {
        return getStem(stem);
    });

    // Load the sound files for this ChannelList
    Promise.all(stems).then(soundRequests => {
        let sounds = soundRequests.map(sound => {
            let soundName = sound['request']['responseURL'].split(/_/)[1];
            SoundBank['addSound'](sound.data);
            initialChannelList.addTrack(new AudioChannel(CONTEXT, sound.data, soundName));
        });
        
        initialChannelList.renderTracks();        
        console.log("Loaded...")
    }).then(() => {
        initialChannelList.startTracks();
        console.log("Rendered...");
    });
}

function getStem(stem){
    return axios.get(`/stem`, {
        params: {stem: stem},
        responseType: "arraybuffer"
    });
}

