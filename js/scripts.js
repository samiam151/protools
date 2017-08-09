import axios from "axios";
import { CONTEXT } from "./AudioComponents/Context";
import { Channel } from "./AudioComponents/Channel";
import { Stems } from "./Helpers/Stems";
import { SoundBank } from "./AudioComponents/SoundBank";
import { TrackList } from "./AudioComponents/TrackList";

"use strict";

window.onload = function(){
    init();
}

function init(){
    let initialTrackList = new TrackList();
    let stems = Stems.map(stem => {
        return getStem(stem);
    });

    // Load the sound files for this TrackList
    Promise.all(stems).then(soundRequests => {
        console.log("Loaded...")
        // 
        let sounds = soundRequests.map(sound => {
            SoundBank.addSound(sound.data);
            initialTrackList.addTrack(new Channel(CONTEXT, sound.data));
        });

        console.log(initialTrackList);
        
    }).then(() => {
        console.log("Rendered...")
        initialTrackList.startTracks();
    });
}

function getStem(stem){
    return axios.get(`/stem`, {
        params: {stem: stem},
        responseType: "arraybuffer"
    });
}