var express = require('express');
var nowjs = require("now");

var app = express.createServer(express.logger());

var everyone = nowjs.initialize(app);

app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.use(express.staticProvider(__dirname + '/public'));

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
