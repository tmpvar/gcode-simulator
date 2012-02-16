(function() {
  function Machine(scene) {

    this.bounds = {
      x: {
        lower : 0,
        upper : 600
      },
      y : {
        lower : 0,
        upper : 600
      },
      z : {
        lower : 0,
        upper : 150
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

  }

  Machine.prototype = {

    sync : function() {
      if (this.rendering) {
        this.models.gantry.top.position.x = this.position.x;
        this.models.spindle.guide.position.y = this.position.y;
        this.models.spindle.housing.position.z = this.position.z;
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
          this.bounds.y.upper - this.bounds.y.lower,
          20
        ),
        this.basicMaterial
      );
      this.models.platform.receiveShadow = true;

      this.models.platform.position.set((this.bounds.x.upper - this.bounds.x.lower)/2, (this.bounds.y.upper - this.bounds.y.lower)/2, 0);
      scene.add(this.models.platform);

      this.models.gantry.top = new THREE.Mesh(
        new THREE.CubeGeometry(
          20,
          this.bounds.y.upper - this.bounds.y.lower,
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
      this.models.gantry.left.position.y = -(this.bounds.y.upper/2) - 5;
      this.models.gantry.top.add(this.models.gantry.left);

      this.models.gantry.right = new THREE.Mesh(
        new THREE.CubeGeometry(
          100,
          10,
          (this.bounds.z.upper - this.bounds.z.lower)+10
        ),
        this.basicMaterial
      );


      this.models.gantry.right.position.y = (this.bounds.y.upper/2) + 5;
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
      this.models.spindle.guide.position.x = -15;
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
      this.models.spindle.housing.position.x = -30;
      this.models.spindle.guide.add(this.models.spindle.housing);

      this.models.spindle.tool = new THREE.Mesh(
        new THREE.CylinderGeometry(4, 4, 16, 16, false),
        this.activeMaterial
      );

      this.models.spindle.tool.position.z = -55;
      this.models.spindle.tool.rotation.set(1.57079633, 0 , 0);
      this.models.spindle.housing.add(this.models.spindle.tool)
    }
  };

  window.Machine = Machine;
})();