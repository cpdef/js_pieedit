var cnv = document.getElementById("cnv"); //, ctx = cnv.getContext("2d");

//window.TEX_DATA
//import * as THREE from 'https://unpkg.com/three@0.118.3/build/three.module.js';

window.engine = {};

var init = function() {
    window.engine.scene = new THREE.Scene();
    var view_div = document.getElementById('3d_view');
    var width = view_div.parentNode.clientHeight, height = 800;
    window.engine.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

    window.engine.renderer = new THREE.WebGLRenderer({canvas: cnv})
    window.engine.renderer.setPixelRatio(window.devicePixelRatio);
    window.engine.renderer.setSize(width, height);

    var materialDecalRoof = new THREE.MeshBasicMaterial({
      map: window.THREETEX,
      side: THREE.DoubleSide,
      //    'wireframe': true,
    });
    var geometry = new THREE.Geometry();
    window.engine.mesh = new THREE.Mesh(geometry, materialDecalRoof);
    window.engine.scene.add(window.engine.mesh);
}


var animate = function() {
  var pos = new THREE.Vector3(0, 100, 0);
  var continous = document.getElementById("renderContinous").checked;
  var zoom =  document.getElementById("Zoom").value;
  var rotationX =  document.getElementById("RotationX").value;
  var rotationY =  document.getElementById("RotationY").value;
  var t=Date.now();
  var camera = window.engine.camera;

  var angx = rotationX*(Math.PI/101);
  if (angx === 0)
    angx = 0.00001;
  var angy = rotationY*(Math.PI/50);
  if (continous)
  {
    angy = t/1000;
    document.getElementById("RotationY").value = (angy / (Math.PI/50)) % 100;
  }
  camera.position.x = zoom * 5 * Math.cos( angy ) * Math.sin( angx );
  camera.position.z = zoom * 5 * Math.sin( angy ) * Math.sin( angx );
  camera.position.y = 100 + zoom * 5 * Math.cos( angx );
  camera.lookAt(pos);

  requestAnimationFrame(animate);
  window.engine.renderer.render(window.engine.scene, camera);
};

init();
animate();
update();

function update()
{
    var edges = document.getElementById("renderEdges").checked;
    var texture = document.getElementById("renderTexture").checked;
    var grid = document.getElementById("renderGrid").checked;
    var animFrame = document.getElementById("animFrame").value / 10000;

    if (grid && (window.engine.grid === undefined))
    {
      window.engine.grid = new THREE.GridHelper(1000, 10);
      window.engine.scene.add(window.engine.grid);
    } else if (!grid && (window.engine.grid != undefined))
    {
      window.engine.scene.remove(window.engine.grid);
      window.engine.grid = undefined;
    }
    var materialTexture = new THREE.MeshBasicMaterial({
      map: window.THREETEX,
      side: THREE.DoubleSide,
    });
    var materialWireframe = new THREE.MeshBasicMaterial({
          wireframe: true,
          color: '#33cc00',
          wireframeLinewidth: 5,
    });
    var group = new THREE.Group();
    for (var level=0;level < window.LEVELS.length;level++)
    {
      var geometry = new THREE.Geometry();
      if (window.LEVELS[level] === undefined)
        break;
      var points = window.LEVELS[level].points;
      var polygons = window.LEVELS[level].polygons;

      if (polygons[0] === undefined)
        return;

      var offset = new THREE.Vector3(0, 0, 0);
      var animFrames = window.LEVELS[level].animframes;
      if (animFrames !== undefined)
      {
        var frame = Math.floor((animFrames.length-1)*animFrame);
        var pos = animFrames[frame].pos;
        // bugfix for https://github.com/Warzone2100/warzone2100/issues/1022
        offset = new THREE.Vector3(pos.x, pos.z, pos.y);
        console.log(level, animFrames, animFrame, frame, offset);
      }

      for (var p=0;p < points.length;p++)
      {
        var point = new THREE.Vector3(points[p][0],points[p][1],-points[p][2]);
        point.add(offset);
        geometry.vertices.push(point);
      }

      for (var polyidx=0;polyidx<polygons.length;polyidx++)
      {
        var poly = polygons[polyidx];
        var po = poly.point_order;
        geometry.faces.push(new THREE.Face3(po[0], po[1], po[2]));
        var face = [];
        for (var tp=0;tp<poly.texture_points.length;tp++)
        {
          var texture_point = poly.texture_points[tp];
          face.push(new THREE.Vector2(
            texture_point[0]/1024,
            1-(texture_point[1]/1024)
          ));
        }
        geometry.faceVertexUvs[0].push(face);
      }
      geometry.verticesNeedUpdate = true;
      geometry.elementsNeedUpdate = true;
      geometry.morphTargetsNeedUpdate = true;
      geometry.uvsNeedUpdate = true;
      geometry.normalsNeedUpdate = true;
      geometry.colorsNeedUpdate = true;
      geometry.tangentsNeedUpdate = true;
      if (edges)
        group.add( new THREE.Mesh( geometry, materialWireframe) );
      if (texture)
        group.add( new THREE.Mesh( geometry, materialTexture) );
    }
    window.engine.scene.remove(window.engine.mesh);
    window.engine.mesh = group;
    window.engine.scene.add(window.engine.mesh);
    console.log("update");
}


