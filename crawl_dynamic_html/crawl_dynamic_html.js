var casper = require('casper').create();
var fs = require('fs');

casper.start('http://xxxxxxxxxxxxxxxxxx/');

casper.then(function() {
  this.click('#search_area > a');
});

casper.wait(1000, function() {
  var getAreaList = function () {
    var ids = [];
    var arealist = document.querySelectorAll('#area > div > ul > li > a');
    for (var i = 0; i < area.length; i++) {
      var id = area[i].id;
      ids.push(id);
    }
    return ids;
  };
  var arealist = this.evaluate(getAreaList);

  casper.each(arealist, function(self, id){
    var url = 'http://xxxxxxxxxxxxxxxxxx/search/index.html#' + id;
    self.thenOpen(url, function(){
      self.wait(5000, function() {
        this.scrollToBottom();
        self.wait(5000, function() {
          this.capture(id + '.png');
          fs.write(id + '.html', this.getHTML(), 'w');
        });
      });
    });
  });
});

casper.run();
