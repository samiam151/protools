import axios from "axios";
import { CONTEXT } from "./AudioComponents/Context";
import { AudioChannel } from "./AudioComponents/AudioChannel";
import { Stems } from "./Helpers/Stems";
import { SoundBank } from "./AudioComponents/SoundBank";
import { ChannelList } from "./AudioComponents/ChannelList";

import "jwt-decode";

"use strict";

window.onload = init;

let initialChannelList = new ChannelList();
function init(){
    let tempBucket = "simprotools";

    // let cookie = document.cookie.split(/;/g).map(eq => {
    //     let split =  eq.split(/=/g);
    //     let key = split[0].length ? split[0] : null;
    //     let value = split[1].length ? split[0] : null;
        
    //     if (key && value) {
    //         return {
    //             [key]: value
    //         }
    //     }

    //     return {};
        
    // });
    // console.log(cookie);
    
    // document.cookie.split(/;/g).map(eq => {
    //     let obj = {};
    //     let strArr = eq.split(/=/g);
    //     obj[strArr[0].replace(/\s/, "")] = strArr[1];
    //     return obj;
    // });
    
    getNames(tempBucket).then(urls => {
        // console.log(urls);
        urls = urls.filter(url => {
            return url['url'].slice("-3") === "wav";
        });
        urls.forEach(url => {
            SoundBank['addSound'](url);
            initialChannelList.addTrack(new AudioChannel(CONTEXT, url['url'], url['name']));
        });

        // console.log(initialChannelList.tracks);

        initialChannelList.renderTracks();

        setTimeout(() => {
            initialChannelList.startTracks();
        }, 2000)
    }).catch(err => console.log(err));
}

function getNames(bucket): Promise<object[]> {
    return new Promise((resolve, reject) => {
        axios.get(`/api/stem/list`, {
            params: {
                bucket: bucket
            }
        }).then(data => {
            // console.log(data);
            let urls = data.data.names.map(name => {
                return {
                    url: `http://${bucket}.s3-external-1.amazonaws.com/${name}`,
                    name: name
                }
            });
            resolve(urls);
        });
    });
}
