import { CONTEXT } from "./Context";

export class ChannelList {
    constructor(initialTracks = null){
        this.tracks = initialTracks ? initialTracks : [];
    }

    addTrack(track){
        this.tracks.push(track);
    }

    startTracks(){
        let currentTime = CONTEXT.currentTime + 2;
        this.tracks.forEach((channel) =>  {
            channel.startAtTime(currentTime);
            console.log(currentTime);
        });
    }

    renderTracks() {
        this.tracks.forEach(track => track.renderTemplate());
    }
}