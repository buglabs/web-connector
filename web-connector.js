var feeds, modules;
feeds = ["Location", "Acceleration"];
modules = {"slot1": "LCD", "slot2": "GPS"};

//acquire acceleration data
var accelZ, accelY, accelX;

//iOS
if (window.DeviceMotionEvent) {
    window.ondevicemotion = function(e) {
        accelZ = e.accelerationIncludingGravity.z;
        accelY = e.accelerationIncludingGravity.y;
        accelX = e.accelerationIncludingGravity.x;
    }
}


//acquire location data
var gpsLat, gpsLon;

//iOS
var gpsHandler = function(location) {
    gpsLat = location.coords.latitude;
    gpsLon = location.coords.longitude;
};
var updateGPS = setInterval(function() {navigator.geolocation.getCurrentPosition(gpsHandler);},1000);


//send functions
var sendCapabilities = function(from) {
    var payload;
    payload = {"capabilities": {"feeds": feeds, "modules": modules}};
    console.log("Sending private capabilities to resource: " + from.resource);
    SWARM.send(payload, [{swarm: document.configuration.swarm_id.value, resource: from.resource}]);
};

var sendFeedResponse = function(sendTo, feed) {    
    var payload;
    if (feed === "Acceleration") {       
        if (accelZ && accelY && accelX) {
            payload = {"Acceleration": {"z": accelZ, "y": accelY, "x": accelX}};
        } else {
            payload = {"Acceleration": "No data"};
        }
    } else if (feed === "Location") {
        if (gpsLat && gpsLon) {
            payload = {"Location":{"latitude": gpsLat, "longitude": gpsLon}};
        } else {
            payload = {"Location": "No data"};
        }
    }
    if (payload) {
        console.log("Sending Feed Response to " + sendTo);
        SWARM.send(payload, [{swarm: document.configuration.swarm_id.value, resource: sendTo}]);
    }
};

var respondToFeedRequest = function(from, payload) {
    var sendTo, feed, params, accelerationInterval, locationInterval;
    sendTo = from.resource;
    feed = payload.feed
    params = payload.params;
    if (params) {
        var frequency = params.frequency;
    }
    if (frequency) {
        accelerationInterval = window[sendTo + "_acceleration"];
        locationInterval = window[sendTo + "_location"];
        if (feed === "Acceleration") {
            if (accelerationInterval) {
                clearInterval(accelerationInterval);
            }            
            window[sendTo + "_acceleration"] = setInterval(function () { sendFeedResponse(sendTo, feed);}, frequency*1000);
        } else if (feed === "Location") {
            if (locationInterval) {
                clearInterval(locationInterval);
            }
            window[sendTo + "_location"] = setInterval(function () { sendFeedResponse(sendTo, feed);}, frequency*1000);
        }
    } else {
        sendFeedResponse(sendTo, feed);
    }
};

var killIntervals = function(from) {
    var resourceID, accelerationInterval, locationInterval;
    resourceID = from.resource;
    accelerationInterval = window[resourceID + "_acceleration"];
    locationInterval = window[resourceID + "_location"];
    if (accelerationInterval) {
        clearInterval(accelerationInterval);
    }
    if (locationInterval) {
        clearInterval(locationInterval);
    }
};

//conditionals
var isSwarmPresence = function(from) {
    if (from.swarm) {
        return true;
    } else {
        return false;
    }    
};

var isPresenceUnavailable = function(type) {
    if (type && (type === "unavailable")) {
        return true;
    } else {
        return false;
    }
};

var isMyPresence = function(from) {
    if (from.resource === document.configuration.resource_id.value) {
        return true;
    } else {
        return false;
    }
};

var isPublicMessage = function(publicVal) {
    if (publicVal === true) {
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

var isFeedRequest = function(payload) {
    if (payload.type && payload.feed) {
        return true;        
    } else {
        return false;
    }
};

//connector initialization
connectorInit = function() {

    SWARM.connect({apikey: document.configuration.participation_key.value,
                   resource: document.configuration.resource_id.value,
                   swarms: [document.configuration.swarm_id.value],

                   //callbacks
                   onconnect:
                       function onConnect() {
                           console.log("Connected to swarm: " + document.configuration.swarm_id.value);
                           $("#input").replaceWith("<h3>Connected to Swarm: " + document.configuration.swarm_id.value + "!</h3><p>Reload to disconnect</p>");
                       },
                   onpresence:
                       function onPresence(presence) {
                           var presenceObj, from, type;
                           
                           presenceObj = JSON.parse(presence);                     
                           from = presenceObj.presence.from;
                           type = presenceObj.presence.type;
                           
                           if (isSwarmPresence(from)) {
                               console.log("Presence: " + presence);
                               if (!isPresenceUnavailable(type) && !isMyPresence(from)) {
                                   sendCapabilities(from);
                               } else if (isPresenceUnavailable(type) && !isMyPresence(type)) {
                                   killIntervals(from);
                               }
                           }
                       },
                   onmessage:
                       function onMessage(message) {
                           console.log("Message: " + message);
                           var messageObj, from, payload, publicVal;
                           
                           messageObj = JSON.parse(message);
                           from = messageObj.message.from;
                           console.log(message);
                           payload = messageObj.message.payload;
                           publicVal = messageObj.message.public;
                           
                           if (isPublicMessage(publicVal)) {
                           }
                           
                           if (isPrivateMessage(publicVal)) {
                               console.log("Private Message: " + message);
                               if (isFeedRequest(payload)) {
                                   console.log("Received Feed Request from " + from.resource);
                                   respondToFeedRequest(from, payload);
                               }
                           }
                       },
                   onerror:
                       function onError(error) {
                           console.log("Error: " + error);
                       }
                  });
};