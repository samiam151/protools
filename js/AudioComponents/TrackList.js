import { CONTEXT } from "./Context";

export class TrackList {
    constructor(initialTracks = null){
        this.tracks = initialTracks ? initialTracks : [];
    }

    addTrack(track){
        this.tracks.push(track);
    }

    startTracks(){
        let currentTime = CONTEXT.currentTime + 5;
        this.tracks.forEach((channel) =>  {
            channel.startAtTime(currentTime);
            console.log(currentTime);
        });
    }
}