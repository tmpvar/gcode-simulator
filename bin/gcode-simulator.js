#!/usr/bin/env node

var nc = require('node-chrome');
var argv = require('optimist').argv;

nc({
  runtime: "/Volumes/Data/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome",
  port: 8080,
  files: __dirname + '/../',
  index: (argv.i) ? "/bare-index.html" : "/index.html",
  width: 1024,
  height: 768
}, function(ws, chrome) {
  var gcode = '';
  process.stdin.on('data', function(d) {
    gcode+=d;
  });

  if (argv.i) {
    process.stdin.on('end', function() {
      ws.send(gcode);
    });

    ws.on('data', function(d) {
      if (d.toString().indexOf('done') > -1) {
        process.exit();
      }
    });

    process.stdin.resume();
  }
});
