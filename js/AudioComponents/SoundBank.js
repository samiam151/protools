export const SoundBank = (function(){
     var obj = {};
    var allTracks = [];

     Object.defineProperty(obj, "sounds", {
         enumerable: true,
         configurable: false,
         
         get: function(){
            return allTracks;
         },
     });

     Object.defineProperty(obj, "addSound", {
         enumerable: false,
         configurable: false,
         writable: false,
         value: function(track){
            allTracks.push(track);
            return allTracks.length;
         }
     })

     return obj; 
}());