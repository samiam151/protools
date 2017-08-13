import { CONTEXT } from "./Context";

export class ChannelList {
    public tracks: any[];

    constructor(initialTracks = []){
        this.tracks = initialTracks;
    }

    addTrack(track){
        this.tracks.push(track);
    }

    startTracks(){
        let currentTime = CONTEXT.currentTime + 2;
        this.tracks.forEach((channel) =>  {
            channel.startAtTime(currentTime);
        });
    }

    renderTracks() {
        this.tracks.forEach(track => track.renderTemplate());
    }
}