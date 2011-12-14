//flot
var plotWidth, zVals, yVals, xVals;
plotWidth = 600;
zVals = [];
yVals = [];
xVals = [];

var fillZ = function () {
    var zCoords;
    zCoords = [];
    for (var i=0; i<zVals.length; i++) {
        zCoords.push([plotWidth-i, zVals[zVals.length-i]]);
    }

    return zCoords;
};

var fillY = function () {
    var yCoords;
    yCoords = [];
    for (var i=0; i<yVals.length; i++) {
        yCoords.push([plotWidth-i, yVals[yVals.length-i]]);
    }

    return yCoords;
};

var fillX = function () {
    var xCoords;
    xCoords = [];
    for (var i=0; i<xVals.length; i++) {
        xCoords.push([plotWidth-i, xVals[xVals.length-i]]);
    }

    return xCoords;
};

var plotOptions = {
    series: {shadowSize: 0},
    yaxis: {min: -20, max: 20},
    xaxis: {min: 0, max: 600, show: false}
};

var plot = $.plot($("#placeholder"), [fillZ(), fillY(), fillX()], plotOptions);

var updatePlot = function(addZ, addY, addX) {
    if (zVals.length >= plotWidth) {
        zVals = zVals.slice(1);
    }
    zVals.push(addZ);
   
    if (yVals.length >= plotWidth) {
        yVals = yVals.slice(1);
    }
    yVals.push(addY);

    if (xVals.length >= plotWidth) {
        xVals = xVals.slice(1);
    }
    xVals.push(addX);

    plot.setData([fillZ(), fillY(), fillX()]);
    plot.draw();
};

//BUGswarm
var participationKey, resourceID, swarmID, webConnectorID, globalZ, globalY, globalX;
participationKey = "0f115574eb6bddd8a4c43f4454ea9f9507b6bdb9";
resourceID = "ddd4eaae87d70ee75f4c59ddb4cdd94bd3aed38c";
swarmID = "244d8089bb8ec55a2fce40b89b59555b052ee96a";
webConnectorID = "d00884c1eb2d2ee6d886da0407028e52fd0ee188";
globalZ = 0;
globalY = 0;
globalX = 0;

SWARM.connect({apikey: participationKey,
               resource: resourceID,
               swarms: [swarmID],
               
               onconnect:
               function onConnect() {
                   console.log("Connected to swarm: " + swarmID);
               },

               onpresence:
               function onPresence(presence) {
                   var presenceObj;
                   presenceObj = JSON.parse(presence).presence;
                   if (presenceObj.from.swarm) {
                       if (presenceObj.type && (presenceObj.type === "unvavailable")) {
                           console.log("PRESENCE UNAVAILABLE: " + presence);
                       } else {
                           console.log("PRESENCE AVAILABLE: " + presence);
                       }
                   }
               },
               
               onmessage:
               function onMessage(message) {
                   var messageObj;
                   messageObj = JSON.parse(message).message;
                   if (messageObj.public === false) {
                       console.log("PRIVATE MESSAGE: " + message);
                       if (messageObj.from.resource === webConnectorID) {
                           
                           //capabilities
                           if (messageObj.payload.capabilities) {
                               console.log("Received capabilities from web connector");
                               var payload = {type: "get", feed: "Acceleration", params: {frequency: 1}};
                               console.log("Requesting Acceleration feed from web connector");
                               SWARM.send(payload, [{swarm: swarmID, resource: webConnectorID}]);
                           }

                           //acceleration feed
                           if (messageObj.payload.Acceleration) {
                               var newX, newY, newZ;
                               if (messageObj.payload.Acceleration.z) {
                                   newZ = messageObj.payload.Acceleration.z;
                                   globalZ = newZ;
                               }                               

                               if (messageObj.payload.Acceleration.y) {
                                   newY = messageObj.payload.Acceleration.y;
                                   globalY = newY;                                
                               } 

                               if (messageObj.payload.Acceleration.x) {
                                   newX = messageObj.payload.Acceleration.x;
                                   globalX = newX;                                 
                               }                                
                           }
                       }                                              
                   }
               },

               onerror:
               function onError(error) {
                   console.log("ERROR: " + error);
               }
              });

var i = setInterval(function() {
    updatePlot(globalZ, globalY, globalX);    
}, 1000);