/// <reference path="./typings/tsd.d.ts" />
"use strict";

import xhr from 'xhr';
var app = <any>{};
app.positions = [];
app.positions.ready = false;
var mapStarted = false;
var markers = [];
var drawingPins = false;
var map: L.Map;
const polTime = 33000;
const countDownSteps = polTime / 1000;
let countDownInterval;
let counterdown = countDownSteps;

var removePins = () => {
    if (!drawingPins && map) {
        drawingPins = true;
        // var curZoom = map.getZoom();

        if (app.positions.ready) {
            markers.forEach(function(m) {
                map.removeLayer(m);
            });
            markers = [];
        }
        drawingPins = false;
    }
};

var redrawPins = () => {
    if (!drawingPins && map) {
        drawingPins = true;
        var bounds = map.getBounds();
        if (app.positions.ready) {
            app.positions.forEach(function(pos) {
                if (bounds.contains(L.latLng(pos.lat, pos.long))) {
                    var mtemp = L.marker([pos.lat, pos.long]);
                    markers.push(mtemp);
                    mtemp.addTo(map)
                        .bindPopup(pos.line);
                }
            });
        }
        drawingPins = false;
    }
};

let countDown = () => {
    counterdown--;
    $('#countdown').text(counterdown.toString() + 's')
};

let getNewPositions = function() {
    app.positions = [];
    app.positions.ready = false;
    xhr({
        url: 'https://rtdrelay2.azurewebsites.net/rtdpos',
        
        method: 'get'
    },
        function(error, response, body) {
            if (!error && response.statusCode == 200) {
                try {
                    var feed = JSON.parse(body);    
                } catch (error) {
                    $('#infotext')
                    .text(body)
                    .show()
                    .css({'color': 'red','font-size':'x-large'});
                    console.log(body)
                }
                
                if (typeof feed === 'object'){
                    $('#infotext').hide();
                    feed.forEach(function(entity) {
                        app.positions.push(entity);
                    });
                    app.positions.ready = true;
                    removePins();
                    redrawPins();
                }
                
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
    if (countDownInterval) { clearInterval(countDownInterval); }
    countDownInterval = setInterval(countDown, 1000);
    counterdown = countDownSteps;
};


function InitMapLoop(startLoc) {
    if (!mapStarted) {
        mapStarted = true;
        $('#infotext').hide();

        map = L.map('map').setView(startLoc, 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        getNewPositions();
        setInterval(getNewPositions, polTime);

        map.on('dragend zoomend', function(e) {
            removePins();
            redrawPins();
        });
    }
}

(function start() {
    setTimeout(function() {
        InitMapLoop(startLoc);
    }, 10000);

    var startLoc = [39.735, -104.99];
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                startLoc = [position.coords.latitude, position.coords.longitude];
                if (!mapStarted) {
                    InitMapLoop(startLoc);
                }
            },
            function(err) {
                if (!mapStarted) {
                    InitMapLoop(startLoc);
                }
            });
    }
    else {
        if (!mapStarted) {
            InitMapLoop(startLoc);
        }
    }

})();


