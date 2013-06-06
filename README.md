# gcode-simulator

Webgl based gcode simulator

## Uses

### from the command line

First, install `npm install -g gcode-simulator`

now you can execute the `gcode-simulator` command at your prompt.  If you want to stream gcode to the simulator add a `-i`.

_example_: `curl http://www.clker.com/cliparts/O/H/c/W/A/o/plane.svg | svgmill -i -z 110 --scale=1 | gcode-simulator -i`

where `svgmill` turns svg into gcode. (`npm install -g svgmill`)

### from the web

open index.html in a webgl capable browser

## License

MIT
