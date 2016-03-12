var casper = require('casper').create();

var LINK_LEVEL = 4;
var TARGET_URL = "http://www.shogakukan.co.jp/fzenshu/4thseason";
var list = {};

casper.start();
casper.viewport(1500, 1000);

function getLinks() {
	var links = document.querySelectorAll('a');
	return Array.prototype.map.call(links, function(e) {
		return e.getAttribute('href');
	});
}

casper.then(function() {
	casper.emit('crawl', TARGET_URL, 0);
});

casper.run();

casper.on('crawl', function (url, level){
	var links = [];
	if (level >= LINK_LEVEL) return;
	if (list[url]) return;
	list[url] = true;

	var us = TARGET_URL.split("/");
	us.pop();
	var base = us.join("/");
	if (url.indexOf(base) < 0) return;

	casper.open(url).then(function () {
		links = casper.evaluate(getLinks);

		Array.prototype.map.call(links, function (href) {
			var absolutePath = casper.evaluate(function (path) {
				var e = document.createElement('span');
				e.innerHTML = '<a href="' + path + '" />';
				return e.firstChild.href;
			}, href);
			if (!absolutePath) return;
			absolutePath = absolutePath.replace(/\#.+$/, "");
			casper.emit('crawl', absolutePath, level + 1);
		});

		casper.open(url).then(function () {
			var savepath = url.split("/").slice(2).join("/");
			if (savepath.substr(savepath.length - 1, 1) == '/') {
				savepath += "index.html";
			}
			casper.download(url, savepath);

			var capturePath = savepath.split(".").slice(0, -1).join(".") + ".png";
			casper.capture(capturePath);
		});
	});
});
