var cnv = document.getElementById("cnv"), ctx = cnv.getContext("2d");
cnv.width = 800;  cnv.height = 600;
ctx.fillStyle = "#000000";

update();

function update() {
	var LEVELS = window.LEVELS;
	var t=Date.now(), ang=t/500, s=Math.sin(ang), c=Math.cos(ang);
  var mat = [ 
      c,0,-s,0,
      0,1,0,100,
      s,0,c,400
  ];
  //ctx.clearRect(0,0,800,600);
  ctx.fillRect(0, 0, 800, 600);
  for (var level=0; level < LEVELS.length; level++)
  {
    draw(LEVELS[level].points, LEVELS[level].polygons, mat);
  }
  window.requestAnimationFrame(update);
}

function draw(ps, polygons, m) {
  for(var i=0; i<polygons.length; i++) {
    var p0 = polygons[i].point_order[0];
    var p1 = polygons[i].point_order[1];
    var p2 = polygons[i].point_order[2];
    var a = vertexShader(ps[p0][0], -ps[p0][1], ps[p0][2], m);
    var b = vertexShader(ps[p1][0], -ps[p1][1], ps[p1][2], m);
    var c = vertexShader(ps[p2][0], -ps[p2][1], ps[p2][2], m);
    fragmentShader(a,b,c);
  }
}

function vertexShader(x,y,z, m) {
	var x0 = m[0]*x+m[1]*y+m[ 2]*z+m[ 3];
  var y0 = m[4]*x+m[5]*y+m[ 6]*z+m[ 7];
  var z0 = m[8]*x+m[9]*y+m[10]*z+m[11];
	return [x0,y0,z0];
}

// you can make a Z-buffer, sampling from texture, phong shading...
function fragmentShader(a,b,c) {
  offx = 400;
  offy = 300;
  var x0=offx+300*a[0]/a[2], y0=offy+300*a[1]/a[2];
  var x1=offx+300*b[0]/b[2], y1=offy+300*b[1]/b[2];
  var x2=offx+300*c[0]/c[2], y2=offy+300*c[1]/c[2];
  // we should loop through all pixels of a 2D triangle ...
  // but we just stroke its outline
  ctx.beginPath();
	ctx.moveTo(x0,y0);  ctx.lineTo(x1,y1);  ctx.lineTo(x2,y2);  ctx.lineTo(x0,y0);
  ctx.strokeStyle = '#33cc00';
  ctx.stroke();  //ctx.fill();
}


