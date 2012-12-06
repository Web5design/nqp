var restler = require('restler');
var async   = require('async');
var config  = require('./config');

var FACEBOOK_APP_ID = (config && config.app ? config.app.app_id : process.env.FACEBOOK_APP_ID);

(function() {
  var dab = {

    generateCode: function(client_id, scope, callback) {
      var data = {
        type:          "device_code",
        client_id:     client_id,
        scope:         scope
      };

      var request = restler.post('https://graph.facebook.com/oauth/device', { data:data });
      
      request.on('fail', function(data) {
        var result = JSON.parse(data);
        callback('Could not generate device code: ' + result.error.message);
      });

      request.on('success', function(r) {
        callback(null, r);
      });
    },

    pollFacebook: function(client_id, verificaiton_code, callback) {
      var data = {
        type:               "device_token",
        client_id:          client_id,
        code:  verificaiton_code
      };

      var request = restler.post('https://graph.facebook.com/oauth/device', { data:data });
      
      request.on('fail', function(data) {
        // Facebook returns a 400 when the user hasn't done
        // their thing yet, so they're not errors necessarily :(
        var result = JSON.parse(data);
        callback(result);
      });

      request.on('success', function(r) {
        callback(null, r, null, r.access_token, null);
      });
    },

    getUserDetails: function(response, fb_id, access_token, expires, callback) {
      // At this point, fb_id and expires are still empty
      var params = {
        fields: 'id',
        access_token: access_token
      }

      var meRequest = restler.get('https://graph.facebook.com/me', {query:params});

      meRequest.on('fail', function(data) {
        var result = JSON.parse(data);
        callback('Request for user data failed: ' + result.error.message);
      });

      meRequest.on('success', function(data) {
        var result = JSON.parse(data);
        fb_id = result.id;
        callback(null, response, fb_id, access_token, null);
      });
    }
  }

  module.exports = dab;
}());