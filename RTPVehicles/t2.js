System.register(['xhr'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var xhr_1;
    var app, mapStarted, markers, drawingPins, map, polTime, countDownSteps, countDownInterval, counterdown, removePins, redrawPins, countDown, getNewPositions;
    function InitMapLoop(startLoc) {
        if (!mapStarted) {
            mapStarted = true;
            $('#infotext').remove();
            map = L.map('map').setView(startLoc, 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            getNewPositions();
            setInterval(getNewPositions, polTime);
            map.on('dragend zoomend', function (e) {
                removePins();
                redrawPins();
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
                        var feed = JSON.parse(body);
                        feed.forEach(function (entity) {
                            app.positions.push(entity);
                        });
                        app.positions.ready = true;
                        removePins();
                        redrawPins();
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
            (function start() {
                setTimeout(function () {
                    InitMapLoop(startLoc);
                }, 10000);
                var startLoc = [39.735, -104.99];
                if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        startLoc = [position.coords.latitude, position.coords.longitude];
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