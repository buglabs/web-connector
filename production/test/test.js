var participationKey, resourceID, swarmID;
participationKey = "0f115574eb6bddd8a4c43f4454ea9f9507b6bdb9";
resourceID = "e14ca8f0502ce66e08cc3a3a4392641b983b0012";
swarmID = "244d8089bb8ec55a2fce40b89b59555b052ee96a";

//conditionals
var isSwarmPresence = function(from) {
    if (from.swarm) {
        return true;
    } else {
        return false;
    }    
};

var isMyPresence = function(from) {
    if (from.resource === resourceID) {
        return true;
    } else {
        return false;
    }
};

var isPrivateMessage = function(publicVal) {
    if (publicVal === false) {
        return true;
    } else {
        return false;
    }
};

//main
SWARM.connect({apikey: participationKey,
               resource: resourceID,
               swarms: [swarmID],

               // callbacks
               onconnect:
                   function onConnect() {
                       console.log("Connected to swarm: " + swarmID);
                       var t = setTimeout(function() {SWARM.send({type:"get", feed:"Acceleration", params:{frequency:1}}, [{swarm:swarmID, resource:"d00884c1eb2d2ee6d886da0407028e52fd0ee188"}])}, 5000);
                   },
               onpresence:
                   function onPresence(presence) {
                       var presenceObj, from, type;
                       
                       presenceObj = JSON.parse(presence);                     
                       from = presenceObj.presence.from;
                       type = presenceObj.presence.type;
        
                       if (isSwarmPresence(from)) {
                           console.log("Presence: " + presence);
                       }
                   },
               onmessage:
                   function onMessage(message) {                 
                       var messageObj, from, payload, publicVal;
               
                       messageObj = JSON.parse(message);
                       from = messageObj.message.from;
                       console.log(message);
                       payload = messageObj.message.payload;
                       publicVal = messageObj.message.public;

                       if (isPrivateMessage(publicVal)) {
                           console.log("Private Message: " + message);
                       }
                   },
               onerror:
                   function onError(error) {
                       console.log("Error: " + error);
                   }
              });