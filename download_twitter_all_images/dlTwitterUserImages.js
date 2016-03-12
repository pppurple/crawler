var twit    = require('twit');
var request = require('request');
var fs      = require('fs');
var Long    = require("long");
var URL     = require('url');

var T = new twit({
	consumer_key:         'YOUR CONSUMER KEY',
	consumer_secret:      'YOUR CONSUMER SECRET',
	access_token:         'YOUR ACCESS TOKEN',
	access_token_secret:  'YOUR ACCESS SECRET',
	app_only_auth:        true
});

var MAX_LOOP = 16;
var maxId;
var params = {
	screen_name : '@SCREEN_NAME',
	count : 200,
	max_id : maxId,
	exclude_replies : false,
	trim_user : true,
	include_rts : true
};

var urls = [];
var cnt  = 1;
getImage(0, download);

function getImage(loop, callback) {
	if (loop >= MAX_LOOP) {
		callback(urls);
		return;
	}
	T.get('statuses/user_timeline', params, function(err, data, response) {
		if (data.length === 0) {
			callback(urls);
			return;
		}
		var minId;
		for(var i = 0; i < data.length; i++) {
			var d = data[i];
			if (d.extended_entities) {
				for(var j = 0; j < d.extended_entities.media.length; j++) {
					console.log(cnt + " : " + d.extended_entities.media[j].media_url);
					urls.push(d.extended_entities.media[j].media_url);
				}
			} else {
				console.log(cnt + " : no image");
			}
			minId = d.id_str;
			cnt++;
		}
		var longId = Long.fromString(minId);
		var longIdSub = longId.subtract(1);
		params.max_id = longIdSub.toString();
		getImage(loop + 1, callback);
	});
}

function download(urls) {
	for (var i = 0; i < urls.length; i++) {
		var url = urls[i];
		var pathname = URL.parse(url).pathname;
		var filename = pathname.replace(/[^a-zA-Z0-9\.]+/g, '_');
		request
			.get(url + ":large")
			.on('end', done(url))
			.on('error', function(err) {
				console.log(err);
			})
			.pipe(fs.createWriteStream(filename));
	}
}

function done(url) {
	return function() {
		console.log("downloaded : " + url);
	};
}