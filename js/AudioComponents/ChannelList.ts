import { CONTEXT } from "./Context";
import { Events } from "../Helpers/Events";``
import { AudioChannel } from "./AudioChannel";

export class ChannelList {
    public tracks: any[];

    constructor(initialTracks = []){
        this.tracks = initialTracks;

        Events.subscribe("track/solo", (pl) => {
            this.tracks.forEach((track: AudioChannel) => {
                console.log(pl.trackToLeave);
                console.log(track.id);
                if (track.id != pl.trackToLeave) {
                    track.toggleMute(true);
                }
            });
        });

        Events.subscribe("track/unsolo", (pl) => {
            this.tracks.forEach((track: AudioChannel) => {
                track.toggleMute(false);
            });
        });
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
        this.tracks.forEach(track => track.initializeTemplate());
    }

    captureLevelState(){
        let arr = [];
        this.tracks.forEach(track => {
            arr.push(track.getLevelState());
        });

        
        return arr;
    }
}