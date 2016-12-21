import { Meteor } from 'meteor/meteor';
import FB from 'fb';
import { Events } from '../imports/api/events.js';
import { getTimespanText } from "../imports/date.js";
FB.mapi = Meteor.wrapAsync(FB.napi);

function Facebook(accessToken) {
    this.fb = Meteor.npmRequire('fbgraph');
    this.accessToken = accessToken;
    this.fb.setAccessToken(this.accessToken);
    this.options = {
        timeout: 3000,
        pool: {maxSockets: Infinity},
        headers: {connection: "keep-alive"}
    }
    this.fb.setOptions(this.options);
}
Facebook.prototype.query = function(query, method) {
    var self = this;
    var method = (typeof method === 'undefined') ? 'get' : method;
    var data = Meteor.sync(function(done) {
        self.fb[method](query, function(err, res) {
            done(null, res);
        });
    });
    return data.result;
}

Facebook.prototype.getUserData = function() {
    return this.query('me');
}

Meteor.startup(() => {
  // code to run on server at startup

});
{

}
Meteor.methods({
	'inserteventData'({eventurl}) {
		console.log("Invoked inserteventData");

		if(eventurl[eventurl.length - 1] == '/'){
			// if '/' is the last char of the url
			eventurl = eventurl.substring(0, eventurl.length - 1);		
		}

		identifier = eventurl.substring(eventurl.lastIndexOf("/"));

		var res = FB.mapi(identifier, {
			access_token: "249276968799606|SbS-5WRPQ8h1YxQmHTNFaw8i3J8"
		});

		// var response = FB.mapi(
  //   		identifier+"/picture", {
  //         access_token: Meteor.user().services.facebook.accessToken
  //   });

  //   res.picture = response.data.url;
  		let start = Date.parse(res.start_time),
  		end = Date.parse(res.end_time);
  		Meteor.call('events.create', {
			name: res.name,
			description: res.description,
			loc: res.place.name,
			lat: res.place.location.latitude,
			lng: res.place.location.longitude,

			time: getTimespanText(start, end),
			start_time: start,
			end_time: end,

			createdAt: new Date(),
      		// picture: res.picture
		});
	}
	// 'posteventData'({name, description, loc, lat,lng, time, picture})
});