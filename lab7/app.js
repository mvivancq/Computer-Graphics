//create the scene
var scene = new THREE.Scene( );

//create the webgl renderer
var renderer = new THREE.WebGLRenderer( );

renderer.setSize(window.innerWidth,window.innerHeight);

//add the renderer to the current document
document.body.appendChild(renderer.domElement );

var ratio = window.innerWidth/window.innerHeight;

//create the perspective camera
//for parameters see https://threejs.org/docs/#api/cameras/PerspectiveCamera
var camera = new THREE.PerspectiveCamera(45,ratio,0.1,1000);
camera.position.set(0,0,-20);

control = new THREE.OrbitControls( camera );

var tissue=null;

function AccessGrid(x,y,subd)
{
  var index=x*subd+y;
  return index;
}

var size=8;
var subd=100;
var material_tissue;
var Init = function ( )
{

    var step=size/subd;
    var geom = new THREE.Geometry();
    for (i=0;i<subd;i++)
      for (j=0;j<subd;j++)
      {
        var pos = new THREE.Vector3(i*step,j*step,0);
        //translate to center for sin fucntion
        var pos_trans= new THREE.Vector3;
        pos_trans.copy(pos);
        pos_trans.add(new THREE.Vector3(-size/2,-size/2,0));
        var len=20*pos_trans.length()/size;
        pos_trans.z=0.1*size*Math.cos(len);

        geom.vertices.push(pos_trans);
      }
      for (i=0;i<subd-1;i++)
        for (j=0;j<subd-1;j++)
        {
          var Idx0=AccessGrid(i,j,subd);
          var Idx1=AccessGrid(i+1,j,subd);
          var Idx2=AccessGrid(i+1,j+1,subd);
          var Idx3=AccessGrid(i,j+1,subd);

          geom.faces.push( new THREE.Face3( Idx1, Idx0, Idx2 ) );
          geom.faces.push( new THREE.Face3( Idx2, Idx0, Idx3 ) );
        }
         geom.computeVertexNormals();
         material_tissue = new THREE.MeshPhongMaterial();
         material_tissue.color=new THREE.Color(1,1,0.4);
         material_tissue.side = THREE.DoubleSide;
         //material_tissue.wireframe=true;
         tissue = new THREE.Mesh( geom, material_tissue );

         tissue.geometry.computeVertexNormals();

         scene.add(tissue);

  }

Init();

//then add ambient
//ambient lighting
var ambientlight = new THREE.AmbientLight(new THREE.Color(1,1,1),0.3);
scene.add(ambientlight);

//lighting
//basic light from camera towards the scene
var cameralight = new THREE.PointLight( new THREE.Color(1,1,1), 0.8 );
cameralight.castShadow=true;
camera.add( cameralight );
scene.add(camera);

var interval = 0.01;
var velocity = 0.05;
var Animate = function()
{
  interval+=velocity;
  for (i = 0; i < tissue.geometry.vertices.length; i++)
  {
    var Pos=tissue.geometry.vertices[i];
    Pos.z = 0;
    var len = 20*Pos.length()/size;
    Pos.z=0.1*size*Math.cos(len+interval);
    tissue.geometry.vertices[i]=Pos;
  }
  tissue.geometry.verticesNeedUpdate = true;
  tissue.geometry.computeVertexNormals();
}
//final update loop
var MyUpdateLoop = function ( )
{

  control.update();
  //call the render with the scene and the camera
  renderer.render(scene,camera);
  //finally perform a recoursive call to update again
  //this must be called because the mouse change the camera position
  requestAnimationFrame(MyUpdateLoop);
  Animate();
};

requestAnimationFrame(MyUpdateLoop);

//this function is called when the window is resized
var MyResize = function ( )
{
  //get the new sizes
  var width = window.innerWidth;
  var height = window.innerHeight;
  //then update the renderer
  renderer.setSize(width,height);
  //and update the aspect ratio of the camera
  camera.aspect = width/height;
  //update the projection matrix given the new values
  camera.updateProjectionMatrix();
  //and finally render the scene again
  renderer.render(scene,camera);
};

var gui;
function buildGui()
{
  gui = new dat.GUI();
  var params = {
    color: material_tissue.color.getHex(),
    velocity_tissue: velocity
  };
  gui.addColor(params, 'color').onChange(function(val){
    material_tissue.color.setHex(val);
  });
  gui.add(params, 'velocity_tissue', -.25, .25).onChange(function(val){
    velocity = val;
  });
  gui.open();
}
buildGui();

//link the resize of the window to the update of the camera
window.addEventListener( 'resize', MyResize);
