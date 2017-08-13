/// @ts-check
"use strict";

export const Events = (function(){
    var topics = {};
    var hOP = topics.hasOwnProperty;

    return {
        subscribe: function(topic, listener){
            // Create topic if it's not yet created
            if(!hOP.call(topics, topic))
                topics[topic] = [];

            // Add the listener to the queue
            var index = topics[topic].push(listener) - 1;

            // Provide handle back for removal of topic
            return {
                remove: function(){
                    delete topics[topic][index];
                }
            }
        },

        emit: function(topic, info = {}){
            // If the topic doesn't exist, or there's no listeners in queue, just leave
            if(!hOP.call(topics, topic))
                return;

            topics[topic].forEach(function(item){
                item(info);
            });
        }
    };
}());