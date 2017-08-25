import axios from "axios";
import { CONTEXT } from "./AudioComponents/Context";
import { AudioChannel } from "./AudioComponents/AudioChannel";
import { Stems } from "./Helpers/Stems";
import { SoundBank } from "./AudioComponents/SoundBank";
import { ChannelList } from "./AudioComponents/ChannelList";

"use strict";

window.onload = init;

let initialChannelList = new ChannelList();
function init(){
    let tempBucket = "bulhtriostems";

    getNames(tempBucket).then(urls => {
        console.log(urls);

        urls.forEach(url => {
            SoundBank['addSound'](url);
            initialChannelList.addTrack(new AudioChannel(CONTEXT, url['url'], url['name']));
        });

        console.log(initialChannelList.tracks);

        initialChannelList.renderTracks();
        initialChannelList.startTracks();
    }).catch(err => console.log(err));
}

function getNames(bucket): Promise<object[]> {
    return new Promise((resolve, reject) => {
        axios.get(`/stem/list`, {
            params: {
                bucket: bucket
            }
        }).then(data => {
            let urls = data.data.names.map(name => {
                return {
                    url: "http://bulhtriostems.s3-external-1.amazonaws.com/" + name,
                    name: name
                }
            });
            resolve(urls);
        });
    });
}

// function getStems(bucket, name){
//     return new Promise((resolve, reject) => {
//          axios({
//             method: "GET",
//             url: `/stem/`,
//             responseType: "arraybuffer",
//             params: {
//                 bucket: bucket,
//                 name: name
//             }   
//         }).then(data => resolve(data));
//     });
// }

