'use strict';
app.positions = [];
app.positions.ready = false;

function InitMapLoop(startLoc) {
    $('#infotext').remove();
    
    
    var map = L.map('map').setView(startLoc, 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);


    var dir = 1, inc = 1;
    var markers = [];

    setInterval(function () {
        if (app.positions.ready) {
            markers.forEach(function (m) {
                map.removeLayer(m);

            });
            markers = [];
            var bounds = map.getBounds();

            app.positions.forEach(function (pos) {

                if (bounds.contains(L.latLng(pos.lat, pos.long))) {

                    var mtemp = L.marker([pos.lat, pos.long]);
                    markers.push(mtemp);
                    mtemp.addTo(map)
                        .bindPopup(pos.line);
                }
            });
            app.positions.ready = false;
        }


        // var curpos = m1.getLatLng();
        // dir = (curpos.lat > 90 || curpos.lat < -90) ? -1 * dir : dir;
        // curpos.lat += inc * dir;
        // m1.setLatLng(curpos);

    }, 1000);
}

app.home = kendo.observable({
    onShow: function () {
    },
    afterShow: function () {
        // var mapOptions = {
        //     center: {lat: 39.659806, lng: -104.941504},
        //     zoom: 11,
        //     mapTypeId: google.maps.MapTypeId.ROADMAP
        // };
        // var map = new google.maps.Map(document.getElementById('map'), mapOptions);
        // google.maps.event.trigger(map, 'resize');
        var mapStarted = false;
        setTimeout(function () {
            mapStarted = true;
            InitMapLoop(startLoc);
        }, 10000);

        var startLoc = [39.735, -104.99];
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    startLoc = [position.coords.latitude, position.coords.longitude];
                    if (!mapStarted) {
                        mapStarted = true;
                        InitMapLoop(startLoc);
                    }
                },
                function (err) {
                    if (!mapStarted) {
                        mapStarted = true;
                        InitMapLoop(startLoc);
                    }
                });
        }
        else {
            if (!mapStarted) {
                mapStarted = true;
                InitMapLoop(startLoc);
            }
        }

    }

});

// START_CUSTOM_CODE_home
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_home
(function (parent) {
    var homeModel = kendo.observable({
        fields: {
            userName: '',
        },
        submit: function () { },
        cancel: function () { }
    });

    parent.set('homeModel', homeModel);


})(app.home);

// START_CUSTOM_CODE_homeModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_homeModel