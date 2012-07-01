function svg2gcode(svg, settings) {
  // clean off any preceding whitespace
  svg = svg.replace(/^[\n\r \t]/gm, '');
  settings = settings || {};
  settings.passes = settings.passes || 1;
  settings.materialWidth = settings.materialWidth || 6;
  settings.passWidth = settings.materialWidth/settings.passes;
  settings.scale = settings.scale || -1;
  settings.cutZ = settings.cutZ || -108; // cut z
  settings.safeZ = settings.safeZ || -106;   // safe z
  settings.feedRate = settings.feedRate || 1400;
  settings.seekRate = settings.seekRate || 1100;
  settings.bitWidth = settings.bitWidth || 1; // in mm

  var
  scale=function(val) {
    return val * settings.scale
  },
  paths = SVGReader.parse(svg, {}).allcolors,
  gcode,
  path;

  var idx = paths.length;
  while(idx--) {
    var subidx = paths[idx].length;
    var bounds = { x : Infinity , y : Infinity, x2 : -Infinity, y2: -Infinity, area : 0};

    // find lower and upper bounds
    while(subidx--) {
      if (paths[idx][subidx][0] < bounds.x) {
        bounds.x = paths[idx][subidx][0];
      }

      if (paths[idx][subidx][1] < bounds.y) {
        bounds.y = paths[idx][subidx][0];
      }

      if (paths[idx][subidx][0] > bounds.x2) {
        bounds.x2 = paths[idx][subidx][0];
      }
      if (paths[idx][subidx][1] > bounds.y2) {
        bounds.y2 = paths[idx][subidx][0];
      }
    }

    // calculate area
    bounds.area = (1 + bounds.x2 - bounds.x) * (1 + bounds.y2-bounds.y);
    paths[idx].bounds = bounds;
  }

  // cut the inside parts first
  paths.sort(function(a, b) {
    // sort by area
    return (a.bounds.area < b.bounds.area) ? -1 : 1;
  });

  gcode = [
    'G90',
    'G1 Z' + settings.safeZ,
    'G82',
    'M4'
  ];

  for (var pathIdx = 0, pathLength = paths.length; pathIdx < pathLength; pathIdx++) {
    path = paths[pathIdx];

    // seek to index 0
    gcode.push(['G1',
      'X' + scale(path[0].x),
      'Y' + scale(path[0].y),
      'F' + settings.seekRate
    ].join(' '));

    for (var p = settings.passWidth; p<=settings.materialWidth; p+=settings.passWidth) {

      // begin the cut by dropping the tool to the work
      gcode.push(['G1',
        'Z' + (settings.cutZ + p),
        'F' + '200'
      ].join(' '));

      // keep track of the current path being cut, as we may need to reverse it
      var localPath = [];
      for (var segmentIdx=0, segmentLength = path.length; segmentIdx<segmentLength; segmentIdx++) {
        var segment = path[segmentIdx];

        var localSegment = ['G1',
          'X' + scale(segment.x),
          'Y' + scale(segment.y),
          'F' + settings.feedRate
        ].join(' ');

        // feed through the material
        gcode.push(localSegment);
        localPath.push(localSegment);

        // if the path is not closed, reverse it, drop to the next cut depth and cut
        // this handles lines
        if (segmentIdx === segmentLength - 1 &&
            (segment.x !== path[0].x || segment.y !== path[0].y))
        {

          p+=settings.passWidth;
          if (p<settings.materialWidth) {
            // begin the cut by dropping the tool to the work
            gcode.push(['G1',
              'Z' + (settings.cutZ + p),
              'F' + '200'
            ].join(' '));

            Array.prototype.push.apply(gcode, localPath.reverse());
          }
        }
      }
    }

    // go safe
    gcode.push(['G1',
      'Z' + settings.safeZ,
      'F' + '300'
    ].join(' '));
  }

  // just wait there for a second
  gcode.push('G4 P1');

  // turn off the spindle
  gcode.push('M5');

  // go home
  gcode.push('G1 Z0 F300');
  gcode.push('G1 X0 Y0 F800');

  return gcode.join('\n');
}
