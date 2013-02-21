#!/usr/bin/env node

var nc = require('node-chrome');

// switch (process.platform) {
//   case 'darwin':
//     if (appName) {
//       opener = 'open -a "' + escape(appName) + '"';
//     } else {
//       opener = 'open';
//     }
//     break;
//   case 'win32':
//     // if the first parameter to start is quoted, it uses that as the title
//     // so we pass a blank title so we can quote the file we are opening
//     if (appName) {
//       opener = 'start "" "' + escape(appName) + '"';
//     } else {
//       opener = 'start ""';
//     }
//     break;
//   default:
//     if (appName) {
//       opener = escape(appName);
//     } else {
//       // use Portlands xdg-open everywhere else
//       opener = path.join(__dirname, '../vendor/xdg-open');
//     }
//     break;
// }

nc({
  runtime: "/Volumes/Data/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome",
  port: 8080,
  files: __dirname + '/../',
  index: "/bare-index.html",
  width: 1024,
  height: 768
}, function(ws, chrome) {
  var gcode = '';
  process.stdin.on('data', function(d) {
    gcode+=d;
  });

  process.stdin.on('end', function() {
    ws.send(gcode);
  });

  ws.on('data', function(d) {
    if (d.toString().indexOf('done') > -1) {
      process.exit();
    }
  });

  ws.on('close', function() {
    chrome.kill('SIGQUIT');
    process.exit();
  });


  process.stdin.resume();
});
