System.register(["xhr", "leaflet"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var xhr_1, leaflet_1, realTimeRtdPos;
    return {
        setters: [
            function (xhr_1_1) {
                xhr_1 = xhr_1_1;
            },
            function (leaflet_1_1) {
                leaflet_1 = leaflet_1_1;
            }
        ],
        execute: function () {
            (function (realTimeRtdPos) {
                var app = {};
                app.positions = [];
                app.positions.ready = false;
                var mapStarted = false;
                var markers = [];
                var drawingPins = false;
                var map;
                var polTime = 4000;
                var intervalID;
                var countDownSteps = polTime / 1000;
                var countDownInterval;
                var counterdown = countDownSteps;
                var myLocation = new leaflet_1.default.LatLng(39.735, -104.99);
                var redIcon = leaflet_1.default.icon({
                    iconUrl: 'marker-icon-red.png',
                    iconSize: [30, 50],
                    iconAnchor: [15, 50],
                });
                var removePins = function () {
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
                var currentMeMarker;
                var redrawPins = function () {
                    if (!drawingPins && map) {
                        drawingPins = true;
                        var bounds_1 = map.getBounds();
                        if (currentMeMarker) {
                            map.removeLayer(currentMeMarker);
                        }
                        currentMeMarker = leaflet_1.default.marker(myLocation, { icon: redIcon }).addTo(map);
                        if (app.positions.ready) {
                            app.positions.forEach(function (pos) {
                                if (bounds_1.contains(leaflet_1.default.latLng(pos.lat, pos.long))) {
                                    var mtemp = leaflet_1.default.marker([pos.lat, pos.long]);
                                    markers.push(mtemp);
                                    mtemp.addTo(map)
                                        .bindPopup(pos.line);
                                }
                            });
                        }
                        drawingPins = false;
                    }
                };
                var countDown = function () {
                    counterdown--;
                    document.getElementById("countdown").textContent = counterdown.toString() + 's';
                };
                var getNewPositions = function () {
                    app.positions = [];
                    app.positions.ready = false;
                    xhr_1.default({
                        url: 'https://rtdrelay2.azurewebsites.net/rtdpos',
                        method: 'get'
                    }, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var feed = void 0;
                            try {
                                feed = JSON.parse(body);
                            }
                            catch (error) {
                                var el = document.getElementById("infotext");
                                el.textContent = body;
                                el.style.visibility = "visible";
                                el.style.color = "red";
                                el.style.fontSize = "large";
                                console.log(body);
                            }
                            if (typeof feed === 'object') {
                                document.getElementById("infotext").style.visibility = "hidden";
                                feed.forEach(function (entity) {
                                    app.positions.push(entity);
                                });
                                clearInterval(intervalID);
                                polTime = 33000;
                                countDownSteps = polTime / 1000;
                                counterdown = countDownSteps;
                                intervalID = setInterval(getNewPositions, polTime);
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
                function InitMapLoop(startLoc) {
                    if (!mapStarted) {
                        mapStarted = true;
                        document.getElementById("infotext").style.visibility = "hidden";
                        map = leaflet_1.default.map('map').setView(startLoc, 15);
                        leaflet_1.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        }).addTo(map);
                        getNewPositions();
                        intervalID = setInterval(getNewPositions, polTime);
                        map.on('dragend zoomend', function (e) {
                            removePins();
                            redrawPins();
                            document.getElementById("mapcenter").style.visibility = "hidden";
                        });
                    }
                }
                function reCenterMap() {
                    if ("geolocation" in navigator) {
                        navigator.geolocation.getCurrentPosition(function (position) {
                            var curLoc = [position.coords.latitude, position.coords.longitude];
                            myLocation = new leaflet_1.default.LatLng(position.coords.latitude, position.coords.longitude);
                            if (mapStarted) {
                                map.setView(curLoc);
                                document.getElementById("mapcenter").style.visibility = "visible";
                            }
                        }, function (err) {
                            var el = document.getElementById("infotext");
                            el.style.visibility = "visible";
                            el.style.color = "red";
                            el.style.fontSize = "large";
                            el.textContent = 'we could not get your devices location, please try again in a few seconds';
                            setTimeout(function () {
                                el.textContent = '';
                                el.style.visibility = "hidden";
                            }, 3000);
                        });
                    }
                }
                (function start() {
                    window.reCenterMap = reCenterMap;
                    setTimeout(function () {
                        InitMapLoop(startLoc);
                    }, 10000);
                    var startLoc = [39.735, -104.99];
                    if ("geolocation" in navigator) {
                        navigator.geolocation.getCurrentPosition(function (position) {
                            startLoc = [position.coords.latitude, position.coords.longitude];
                            myLocation = new leaflet_1.default.LatLng(position.coords.latitude, position.coords.longitude);
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
            })(realTimeRtdPos || (realTimeRtdPos = {}));
        }
    };
});
//# sourceMappingURL=t2.js.map