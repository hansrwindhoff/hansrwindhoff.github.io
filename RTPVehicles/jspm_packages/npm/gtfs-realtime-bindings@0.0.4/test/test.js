/* */ 
var GtfsRealtimeApi = require('../gtfs-realtime');
var fs = require('fs');
var should = require('should');
describe('GtfsRealtimeApi', function() {
  describe('FeedMessage#decode()', function() {
    it('should decode proto data without error', function(done) {
      fs.readFile("test/vehicle_position.pb", function(err, data) {
        if (err)
          throw err;
        var feed = GtfsRealtimeApi.FeedMessage.decode(data);
        feed.entity.should.have.length(1);
        feed.entity[0].should.have.property('id', '1');
        feed.entity[0].should.have.property('vehicle');
        var vehicle = feed.entity[0].vehicle;
        vehicle.should.have.properties('trip', 'vehicle', 'position');
        done();
      });
    });
  });
});
