import axios from "axios";
import { CONTEXT } from "./AudioComponents/Context";
import { AudioChannel } from "./AudioComponents/AudioChannel";
import { Stems } from "./Helpers/Stems";
import { SoundBank } from "./AudioComponents/SoundBank";
import { ChannelList } from "./AudioComponents/ChannelList";

"use strict";

window.onload = init;

function init(){
    let initialChannelList = new ChannelList();
    // let stems = Stems.map(stem => {
    //     return getStem(stem);
    // });

    getStems().then((res) => {
        console.log(res);
        let stems = res;
        console.log(res);

        Promise.all(stems).then(data => {
            console.log(data);
            // let sounds = soundRequests.map(sound => {
            //     let soundName = sound['request']['responseURL'].split(/_/)[1];
            //     SoundBank['addSound'](sound.data);
            //     initialChannelList.addTrack(new AudioChannel(CONTEXT, sound.data, soundName));
            // });
            
            // initialChannelList.renderTracks();        
            // console.log("Loaded...")
        // }).then(() => {
        //     initialChannelList.startTracks();
        //     console.log("Rendered...");
        // });
        

        })
    })
    .catch(err => console.log(err));

    // Load the sound files for this ChannelList
    // Promise.all(stems).then(soundRequests => {
    //     let sounds = soundRequests.map(sound => {
    //         let soundName = sound['request']['responseURL'].split(/_/)[1];
    //         SoundBank['addSound'](sound.data);
    //         initialChannelList.addTrack(new AudioChannel(CONTEXT, sound.data, soundName));
    //     });
        
    //     initialChannelList.renderTracks();        
    //     console.log("Loaded...")
    // }).then(() => {
    //     initialChannelList.startTracks();
    //     console.log("Rendered...");
    // });
    
}

function getStems(){
    return axios.get(`/stem/`);
}

