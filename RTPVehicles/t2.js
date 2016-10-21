System.register(['xhr'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var xhr_1;
    var app, mapStarted, markers, drawingPins, map, polTime, countDownSteps, countDownInterval, counterdown, removePins, currentMeMarker, redrawPins, countDown, getNewPositions, RedIcon, redIcon, myLocation;
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
            map.on('dragend zoomend', function (e) {
                removePins();
                redrawPins();
                $('#mapcenter').hide();
            });
        }
    }
    function reCenterMap() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var curLoc = [position.coords.latitude, position.coords.longitude];
                myLocation = new L.LatLng(position.coords.latitude, position.coords.longitude);
                if (mapStarted) {
                    map.setView(curLoc);
                    $('#mapcenter').show();
                }
            }, function (err) {
                $('#infotext')
                    .text('we could not get your devices location, please try again in a few seconds')
                    .show()
                    .css({ 'color': 'red', 'font-size': 'large' });
                setTimeout(function () {
                    $('#infotext')
                        .text('')
                        .hide();
                }, 3000);
            });
        }
    }
    return {
        setters:[
            function (xhr_1_1) {
                xhr_1 = xhr_1_1;
            }],
        execute: function() {
            app = {};
            app.positions = [];
            app.positions.ready = false;
            mapStarted = false;
            markers = [];
            drawingPins = false;
            polTime = 33000;
            countDownSteps = polTime / 1000;
            counterdown = countDownSteps;
            removePins = function () {
                if (!drawingPins && map) {
                    drawingPins = true;
                    if (app.positions.ready) {
                        markers.forEach(function (m) {
                            map.removeLayer(m);
                        });
                        markers = [];
                    }
                    drawingPins = false;
                }
            };
            redrawPins = function () {
                if (!drawingPins && map) {
                    drawingPins = true;
                    var bounds = map.getBounds();
                    if (currentMeMarker) {
                        map.removeLayer(currentMeMarker);
                    }
                    currentMeMarker = L.marker(myLocation, { icon: redIcon }).addTo(map);
                    if (app.positions.ready) {
                        app.positions.forEach(function (pos) {
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
            countDown = function () {
                counterdown--;
                $('#countdown').text(counterdown.toString() + 's');
            };
            getNewPositions = function () {
                app.positions = [];
                app.positions.ready = false;
                xhr_1.default({
                    url: 'https://rtdrelay2.azurewebsites.net/rtdpos',
                    method: 'get'
                }, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        try {
                            var feed = JSON.parse(body);
                        }
                        catch (error) {
                            $('#infotext')
                                .text(body)
                                .show()
                                .css({ 'color': 'red', 'font-size': 'large' });
                            console.log(body);
                        }
                        if (typeof feed === 'object') {
                            $('#infotext').hide();
                            feed.forEach(function (entity) {
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
                if (countDownInterval) {
                    clearInterval(countDownInterval);
                }
                countDownInterval = setInterval(countDown, 1000);
                counterdown = countDownSteps;
            };
            RedIcon = L.Icon.Default.extend({
                options: {
                    iconUrl: 'images/marker-icon-red.png'
                }
            });
            redIcon = new RedIcon();
            (function start() {
                window.reCenterMap = reCenterMap;
                setTimeout(function () {
                    InitMapLoop(startLoc);
                }, 10000);
                var startLoc = [39.735, -104.99];
                if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        startLoc = [position.coords.latitude, position.coords.longitude];
                        myLocation = new L.LatLng(position.coords.latitude, position.coords.longitude);
                        if (!mapStarted) {
                            InitMapLoop(startLoc);
                        }
                    }, function (err) {
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
        }
    }
});
//# sourceMappingURL=t2.js.map