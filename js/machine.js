(function() {
  function Machine(scene) {

    this.bounds = {
      x: {
        lower : 0,
        upper : 1000
      },
      y : {
        lower : 0,
        upper : 1000
      },
      z : {
        lower : 0,
        upper : 120
      }
    };

    this.models = {
      gantry : {},
      spindle : {}
    };

    this.position = {
      x : 0,
      y : 0,
      z : 0
    };

    this.lines = [];

    this.settings = {
      zSafe : 106,
      zCut : 108
    };

    this.queue = [];

    this.modes = {
      absolute : true
    };
  }

  Machine.prototype = {

    sync : function() {
      if (this.rendering) {
        this.models.gantry.top.position.x = this.position.x - (this.bounds.x.upper - this.bounds.x.lower)/2;
        this.models.spindle.guide.position.y = this.position.y - (this.bounds.y.upper - this.bounds.y.lower)/2;
        this.models.spindle.housing.position.z = ((this.bounds.z.upper - this.bounds.z.lower)/2 - this.position.z) + 15;
      }
    },

    prepareModels : function() {
      this.rendering = true;
      this.basicMaterial = new THREE.MeshPhongMaterial({
        color: 0xEFEFEF,
        ambient: 0xEFEFEF,
      });

      this.activeMaterial =   new THREE.MeshPhongMaterial({
        color: 0xFF5F00,
        ambient: 0xFF5F00,
        opacity : 0.85,
        shininess : 0,
        metal: true,
        perPixel : true,

      });

      this.models.platform = new THREE.Mesh(
        new THREE.CubeGeometry(
          this.bounds.x.upper - this.bounds.x.lower,
          50 + this.bounds.y.upper - this.bounds.y.lower,
          20
        ),
        this.basicMaterial
      );
      this.models.platform.receiveShadow = true;

      this.models.platform.position.set(
          (this.bounds.x.upper - this.bounds.x.lower)/2,
          25-(this.bounds.y.upper - this.bounds.y.lower)/2,
          0
      );
      scene.add(this.models.platform);

      this.models.gantry.top = new THREE.Mesh(
        new THREE.CubeGeometry(
          20,
          50 + this.bounds.y.upper - this.bounds.y.lower,
          50
        ),
        this.basicMaterial
      );


      this.models.gantry.top.position.z = this.bounds.z.upper-this.bounds.z.lower-25;

      this.models.platform.add(this.models.gantry.top);

      this.models.gantry.left = new THREE.Mesh(
        new THREE.CubeGeometry(
          100,
          10,
          (this.bounds.z.upper - this.bounds.z.lower)+10
        ),
        this.basicMaterial
      );

      this.models.gantry.left.position.z = (-this.bounds.z.upper/2) + 20;
      this.models.gantry.left.position.y = -(this.bounds.y.upper/2) - 30;
      this.models.gantry.top.add(this.models.gantry.left);

      this.models.gantry.right = new THREE.Mesh(
        new THREE.CubeGeometry(
          100,
          10,
          (this.bounds.z.upper - this.bounds.z.lower)+10
        ),
        this.basicMaterial
      );


      this.models.gantry.right.position.y = (this.bounds.y.upper/2) + 30;
      this.models.gantry.right.position.z = (-this.bounds.z.upper/2) + 20;
      this.models.gantry.top.add(this.models.gantry.right);


      this.models.spindle.guide = new THREE.Mesh(
        new THREE.CubeGeometry(
          10,
          50,
          (this.bounds.z.upper - this.bounds.z.lower)
        ),
        this.basicMaterial
      );

      this.models.spindle.guide.position.z = (this.bounds.z.upper/6);
      this.models.spindle.guide.position.x = 15;
      this.models.gantry.top.add(this.models.spindle.guide);


      this.models.spindle.housing = new THREE.Mesh(
        new THREE.CubeGeometry(
          50,
          50,
          100
        ),
        this.activeMaterial
      );

      this.models.spindle.housing.position.z = this.bounds.z.upper/4;
      this.models.spindle.housing.position.x = 30;
      this.models.spindle.guide.add(this.models.spindle.housing);

      this.models.spindle.tool = new THREE.Mesh(
        new THREE.CylinderGeometry(4, 1, 16, 16, false),
        this.activeMaterial
      );

      this.models.spindle.tool.position.z = -58;
      this.models.spindle.tool.rotation.set(1.57079633, 0 , 0);
      this.models.spindle.housing.add(this.models.spindle.tool)
    },

    fromString : function(str) {
      this.queue = str.split('\n');
    },
    addLine : function(gcode) {
      if (gcode) {
        this.queue.push(gcode);
      }
    },
    processLine : function(gcode, done) {
      if (!gcode) { return done() };
      var
      parts = gcode.toLowerCase().replace(/[ \t]/g,'').match(/[a-z][^a-z]*/ig),
      commandPair = parts.shift(),
      command = commandPair.substring(0,1),
      subcommand = parseInt(commandPair.substring(1), 10);

      done = done || function() {
        console.log('DONE!',  JSON.stringify(this.position));
      };

      switch (command) {
        case 'g':
          switch (subcommand) {
            case 0:
            case 1:
              var vars = {
                x : this.position.x,
                y : this.position.y,
                z : this.position.z,
                f : 600
              };


              while(parts.length > 0) {
                var part = parts.shift();
                vars[part.substring(0,1)] = parseFloat(part.substring(1));
              }

              // Hande relative positioning
              if (this.absolute === false) {
                vars.x += this.position.x;
                vars.y += this.position.y;
                vars.z += this.position.z;
              }

              var
              that = this,
              start = Date.now()
              ox = that.position.x,
              oy = that.position.y,
              oz = that.position.z,
              rx = ((that.bounds.x.upper - that.bounds.x.lower)/2)-45,
              ry = ((that.bounds.y.upper - that.bounds.y.lower)/2),
              rz = ((that.bounds.z.upper - that.bounds.z.lower)/2)+65;

              setTimeout(function movementTick() {

                var
                now = Date.now(),
                ratio = vars.f/600000,
                dx = (vars.x - that.position.x),
                dy = (vars.y - that.position.y),
                dz = (vars.z - that.position.z);

                if (Math.abs(dx) > ((now - start) * ratio)) {
                  that.position.x += dx * ((now - start) * ratio);
                } else {
                  that.position.x = vars.x;
                }

                if (Math.abs(dy) > ((now - start) * ratio)) {
                  that.position.y += dy * ((now - start) * ratio);
                } else {
                  that.position.y = vars.y;
                }

                if (Math.abs(dz) > ((now - start) * ratio)) {
                  that.position.z += dz * ((now - start) * ratio);
                } else {
                  that.position.z = vars.z;
                }



                if (that.position.x !== vars.x || that.position.y !== vars.y || that.position.z !== vars.z) {
                 that.timer = setTimeout(movementTick, 16);
                } else {
                  if (oz > that.settings.zCut && that.position.z > that.settings.zCut) {
                    var geometry = new THREE.Geometry();

                    geometry.vertices.push(new THREE.Vertex(new THREE.Vector3(ox - rx, oy - ry, rz - oz)));
                    geometry.vertices.push(
                      new THREE.Vertex(
                        new THREE.Vector3(that.position.x-rx, that.position.y-ry, rz - that.position.z)
                      )
                    );

                    var line = new THREE.Line(
                      geometry,
                      new THREE.LineBasicMaterial( { color: 0x0057FF, linewidth: 2, opacity: 0.7 } ),
                      THREE.LinePieces
                    );
                    that.lines.push(line);
                    that.models.platform.add(line);

                  }

                  done();
                }
              }, 0);
            break;

            // dwell
            case 4:
              setTimeout(done, parseInt(parts.shift().substring(1), 10));
            break;

            // absolute positioning mode (default)
            case 90:
              this.absolute = true;
              done();
            break;

            // relative positioning mode
            case 91:
              this.absolute = false;
              done();
            break;

            default:
              done(new Error('invalid G subcommand'));
            break;
          }
        break;

        case 'm':
          switch (subcommand) {

            // spindle on clockwise
            case 3:
              done();
            break;

            // spindle on counter-clockwise
            case 4:
              done();
            break;

            // spindle off
            case 5:
              done();
            break;

            default:
              done(new Error('invalid M subcommand'));
            break;

          }
        break;

        default:
          done(new Error('invalid command'))
        break;
      }
    },
    processNext : function(done) {
      this.currentGcode = this.queue.shift();
      console.log('processing:',this.currentGcode)
      this.processLine(this.currentGcode, done);
    },
    begin : function(fn) {
      var that = this;
      clearTimeout(that.timer);
      var done = function(error) {
        console.log(error ? error.message : 'ok');

        if (that.queue && that.queue.length > 0) {
          that.timer = setTimeout(function() {
            that.processNext(done);
          }, 0);
        } else {
          fn();
        }
      };

      done();
    },
    cancel : function() {
      clearTimeout(this.timer);
      this.queue = [];
      var that = this;
      this.position = { x : 0, y :0, z : 0};

      while (this.lines.length > 0) {
        var line = this.lines.pop();
        this.models.platform.remove(line);
      }
    }
  };

  window.Machine = Machine;
})();