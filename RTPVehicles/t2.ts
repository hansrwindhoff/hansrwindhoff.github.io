/// <reference path="./typings/tsd.d.ts" />
"use strict";

import xhr from 'xhr';
import { default as L } from 'leaflet';

module realTimeRtdPos {

    let app = <any>{};
    app.positions = [];
    app.positions.ready = false;
    let mapStarted = false;
    let markers = [];
    let drawingPins = false;
    let map: L.Map;
    let polTime = 30000;
    let intervalID;
    let countDownSteps = polTime / 1000;
    let countDownInterval;
    let counterdown = countDownSteps;
    let myLocation = new L.LatLng(39.735, -104.99);

    interface Window {
        reCenterMap: () => void;

    }
    declare var window: Window;

    let redIcon = L.icon({
        iconUrl: 'marker-icon-red.png',
        // iconRetinaUrl: 'my-icon@2x.png',
        iconSize: [30, 50],
        iconAnchor: [15, 50],
        // popupAnchor: [-3, -76],
        // shadowUrl: 'my-icon-shadow.png',
        // shadowRetinaUrl: 'my-icon-shadow@2x.png',
        // shadowSize: [68, 95],
        // shadowAnchor: [22, 94]
    });

    let removePins = () => {
        if (!drawingPins && map) {
            drawingPins = true;
            // let curZoom = map.getZoom();

            if (app.positions.ready) {
                markers.forEach(function (m) {
                    map.removeLayer(m);
                });
                markers = [];
            }
            drawingPins = false;
        }
    };

    let currentMeMarker: L.Marker;
    let redrawPins = () => {
        if (!drawingPins && map) {
            drawingPins = true;
            let bounds = map.getBounds();
            if (currentMeMarker) {
                map.removeLayer(currentMeMarker)
            }

            currentMeMarker = L.marker(myLocation, { icon: redIcon }).addTo(map);
            if (app.positions.ready) {
                app.positions.forEach(function (pos) {
                    if (bounds.contains(L.latLng(pos.lat, pos.long))) {
                        let mtemp = L.marker([pos.lat, pos.long]);
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
        document.getElementById("countdown").textContent = counterdown.toString() + 's';
        //$('#countdown').text(counterdown.toString() + 's')
    };

    let getNewPositions = function () {
        app.positions = [];
        app.positions.ready = false;

        xhr({
            url: 'https://rtdrelay2.azurewebsites.net/rtdpos',
            method: 'get'
        },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    let feed;

                    try {
                        feed = JSON.parse(body);
                    } catch (error) {
                        var el = document.getElementById("infotext");
                        el.textContent = body;
                        el.style.visibility = "visible";
                        el.style.color = "red";
                        el.style.fontSize = "large";


                        // $('#infotext')
                        //     .text(body)
                        //     .show()
                        //     .css({ 'color': 'red', 'font-size': 'large' });
                        console.log(body)
                    }

                    if (typeof feed === 'object') {
                        document.getElementById("infotext").style.visibility = "hidden";

                        // $('#infotext').hide();
                        feed.forEach(function (entity) {
                            app.positions.push(entity);
                        });

                        clearInterval(intervalID);
                        polTime = 33000;// once we have the first payload we reduce the poltime
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
        if (countDownInterval) { clearInterval(countDownInterval); }
        countDownInterval = setInterval(countDown, 1000);
        counterdown = countDownSteps;
    };


    function InitMapLoop(startLoc) {
        if (!mapStarted) {
            mapStarted = true;
            document.getElementById("infotext").style.visibility = "hidden";
            //$('#infotext').hide();

            map = L.map('map').setView(startLoc, 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            getNewPositions();
            intervalID = setInterval(getNewPositions, polTime);

            map.on('dragend zoomend', function (e) {
                removePins();
                redrawPins();
                document.getElementById("mapcenter").style.visibility = "hidden";
                //$('#mapcenter').hide();
            });
        }
    }
    function reCenterMap() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    let curLoc = [position.coords.latitude, position.coords.longitude];
                    myLocation = new L.LatLng(position.coords.latitude, position.coords.longitude);
                    if (mapStarted) {
                        map.setView(curLoc);
                        removePins();
                        redrawPins();
                        document.getElementById("mapcenter").style.visibility = "visible";
                        //$('#mapcenter').show();

                    }
                },
                function (err) {
                    var el = document.getElementById("infotext");
                    el.style.visibility = "visible";
                    el.style.color = "red";
                    el.style.fontSize = "large"
                    el.textContent = 'we could not get your devices location, please try again in a few seconds';

                    // $('#infotext')
                    //     .text('we could not get your devices location, please try again in a few seconds')
                    //     .show()
                    //     .css({ 'color': 'red', 'font-size': 'large' });

                    setTimeout(() => {
                        el.textContent = '';
                        el.style.visibility = "hidden";
                        // $('#infotext')
                        //     .text('')
                        //     .hide()
                    }, 3000)

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
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    startLoc = [position.coords.latitude, position.coords.longitude];
                    myLocation = new L.LatLng(position.coords.latitude, position.coords.longitude);
                    if (!mapStarted) {
                        InitMapLoop(startLoc);
                    }
                },
                function (err) {
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