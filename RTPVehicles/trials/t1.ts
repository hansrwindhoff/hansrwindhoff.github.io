/// <reference path="./typings/tsd.d.ts" />
// test script for the node server endpoint
"use strict";
import xhr from 'xhr';
declare var app;

app.positions = [];
app.positions.ready = false;
let getNewPositions =  function() {
        app.positions = [];
        app.positions.ready = false;



        xhr({
            //url: 'http://www.rtd-denver.com/google_sync/VehiclePosition.pb',
            // url: 'http://localhost:1337/rtdpos',
            url: 'https://rtdrelay2.azurewebsites.net/rtdpos',
            method: 'get'
        },
            function(error, response, body) {
                if (!error && response.statusCode == 200) {
                   // console.log('server encoded the data as: ' + (response.headers['content-encoding'] || 'identity'));

                    // var feed = GtfsRealtimeBindings.FeedMessage.decode(body);
                    // console.log(feed.header);
                    var feed = JSON.parse(body);
                    //console.log((new Date(feed.header.timestamp.low * 1000).toUTCString()));
                    //feed.entity.forEach(function(entity) {
                    feed.forEach(function(entity) {

                        //console.log(entity);
                        app.positions.push(entity);
                        // if (entity.trip_update) {
                        //     console.log(entity.trip_update);
                        // }
                        // if (entity.vehicle) {
                        //     console.log(entity.vehicle.vehicle.id + ' '
                        //         + entity.vehicle.position.latitude + ' '
                        //         + entity.vehicle.position.longitude + ' '
                        //         + ((entity.vehicle.position.bearing >= 0 && entity.vehicle.position.bearing <= 360) ? entity.vehicle.position.bearing : 'invalid bearing') + ' ');
                        // }
                    });
                    app.positions.ready = true;
                }
                else if (error) {
                    console.log('request returned an error');
                    console.log(error);
                }
                else if (response.statusCode != 200) {
                    console.log('status code === ' + response.statusCode);
                    console.log(error);
                }
            });
    } ;
getNewPositions();
setInterval(getNewPositions, 5000);

//# sourceMappingURL=t1.js.map