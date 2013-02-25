// set the scene size
var WIDTH = 570,
  HEIGHT = 569;

// set some camera attributes
var VIEW_ANGLE = 45,
  ASPECT = WIDTH / HEIGHT,
  NEAR = 0.1,
  FAR = 10000;

// get the DOM element to attach to
// - assume we've got jQuery to hand
var container = document.getElementById('3d');

// create a WebGL renderer, camera
// and a scene
var renderer = new THREE.WebGLRenderer({
  antialias : true
});

var camera =
  new THREE.PerspectiveCamera(
    VIEW_ANGLE,
    ASPECT,
    NEAR,
    FAR);

if (window.THREEx && THREEx.WindowResize) {
  console.log("HERE")
  THREEx.WindowResize(renderer, camera);
}


var scene = new THREE.Scene();

// the camera starts at 0,0,0
// so pull it back
camera.position.set(1900, -200, 300);
//camera.lookAt(new Vector3(0,0,0));
camera.rotation.x = 2.5;
camera.rotation.y = 1.85;
camera.rotation.z = -1;

scene.add(camera);

// start the renderer
renderer.setSize(WIDTH, HEIGHT);
renderer.shadowMapEnabled = true;
// attach the render-supplied DOM element
container.appendChild(renderer.domElement);


// create the sphere's material
var activePartMaterial =
  new THREE.MeshPhongMaterial(
    {
      color: 0xFF5F00,
      ambient: 0xFF5F00,
      opacity : 0.85,
      shininess : 0,
      metal: true,
      perPixel : true,
      //ambient: 0xEFEFEF
    });


var machine = new Machine();
machine.prepareModels(scene);

// create a point light
var light =
  new THREE.PointLight(0xFFFFFF, .5);

// set its position
light.position.x = 0;
light.position.y = 0;
light.position.z = 0;

// add to the scene
camera.add(light);

// create a point light
var light2 =
  new THREE.SpotLight(0xFFFFFF, 1);

// set its position
light2.position.x = 0;
light2.position.y = 1200;
light2.position.z = 0;
light2.castShadow = true;

// add to the scene
camera.add(light2);


// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

var windowHalfX = WIDTH / 2;
var windowHalfY = HEIGHT / 2;
var mouseXOnMouseDown, targetRotationOnMouseDown, targetRotation = 0, mouseX = 0, mouseY = 0;

var downX, downY, down = false;
container.addEventListener('mousedown', function(e) {
  downX = e.clientX;
  downY = e.clientY;
  down = true;
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'mouseup', function() {
    mouseX = 0;
    down = false;
    document.removeEventListener('mousemove', onDocumentMouseMove, false );
  });
});



function onDocumentMouseMove( event ) {
  mouseX = ((event.clientX-downX));
  mouseY = ((event.clientY-downY));
  targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;
}



var stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.right = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);

(function animloop(){
  requestAnimFrame(animloop);
  stats.update();
  machine.sync();

  if (down) {
    machine.models.platform.rotation.z += (mouseX)*.0001;
    if (mouseY) {
      camera.position.multiplyScalar(1 + ((mouseY) * 0.0001));
    }
  }

  //camera.position.x = machine.models.spindle.tool.matrixWorld.getPosition().x;
  //camera.position.y = machine.models.spindle.tool.matrixWorld.getPosition().y;

  //camera.lookAt(machine.models.platform.matrixWorld.getPosition());
  //camera.rotation.z = 1.5
  renderer.render(scene, camera);
})();

