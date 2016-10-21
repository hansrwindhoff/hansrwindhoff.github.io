System.register(['xhr'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var xhr_1;
    var getNewPositions;
    return {
        setters:[
            function (xhr_1_1) {
                xhr_1 = xhr_1_1;
            }],
        execute: function() {
            app.positions = [];
            app.positions.ready = false;
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
            };
            getNewPositions();
            setInterval(getNewPositions, 5000);
        }
    }
});
//# sourceMappingURL=t1.js.map