var cnv = document.getElementById("cnv"), ctx = cnv.getContext("2d");
cnv.width = 800;  cnv.height = 600;
var texture_render_lock = false;

update();

function update(dtime=0, force=false) {
  var edges = document.getElementById("renderEdges").checked;
  var texture = document.getElementById("renderTexture").checked;
  if ((!texture) && (!edges))
  {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 800, 600);
    return;
  }
  if (!texture)
    texture_render_lock = false;
  if (texture_render_lock && (!force))
    return;
  if (texture)
    texture_render_lock = true;
  var t=Date.now();
  var ang=t/500, s=Math.sin(ang), c=Math.cos(ang);
  var mat = [ 
      c,0,-s,0,
      0,1,0,100,
      s,0,c,400
  ];
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, 800, 600);
  if (texture)
    clearZBuffer();
  for (var level=0; level < LEVELS.length; level++)
  {
    draw(window.LEVELS[level].points, window.LEVELS[level].polygons, mat, edges, texture);
  }
  window.requestAnimationFrame(update);
}

function clearZBuffer()
{
  window.ZBuffer = new Array(cnv.width*cnv.height).fill("-");
  console.log("ZBuffer clear: ", window.ZBuffer[10*cnv.width+10]);
}

function draw(ps, polygons, m, edges=true, texture=false) {
  for(var i=0; i<polygons.length; i++) {
    var p0 = polygons[i].point_order[0];
    var p1 = polygons[i].point_order[1];
    var p2 = polygons[i].point_order[2];
    if ((ps[p1] === undefined) || (ps[p0] === undefined) || (ps[p2] === undefined))
      return
    var a = vertexShader(ps[p0][0], -ps[p0][1], ps[p0][2], m);
    var b = vertexShader(ps[p1][0], -ps[p1][1], ps[p1][2], m);
    var c = vertexShader(ps[p2][0], -ps[p2][1], ps[p2][2], m);
    var tp = polygons[i].texture_points;
//    console.log("draw fragment Shader", a, b, c, tp);
    if (texture)
      fragmentShaderTexture(a,b,c,tp[0],tp[1],tp[2]);
    if (edges)
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
  ctx.strokeStyle = '#33cc00';
  ctx.beginPath();
    ctx.moveTo(x0,y0);  ctx.lineTo(x1,y1);  ctx.lineTo(x2,y2);
  ctx.closePath();
  ctx.stroke();
}

function fragmentShaderTexture(a,b,c,ta,tb,tc) {
  offx = 400;
  offy = 300;
  var x0=offx+300*a[0]/a[2], y0=offy+300*a[1]/a[2], z0 = a[2];
  var x1=offx+300*b[0]/b[2], y1=offy+300*b[1]/b[2], z1 = b[2];
  var x2=offx+300*c[0]/c[2], y2=offy+300*c[1]/c[2], z2 = c[2];


  lineFromLine(x0, y0, z0, x1, y1, z1, x2, y2, z2, ta, tb, tc);
  lineFromLine(x1, y1, z1, x2, y2, z2, x0, y0, z0, tb, tc, ta);
  lineFromLine(x2, y2, z2, x0, y0, z0, x1, y1, z1, tc, ta, tb);
}


function lineFromLine(x1, y1, z1, x2, y2, z2, x3, y3, z3, t1, t2, t3)
{
  var tx1, ty1, tx2, ty2, tx3, ty3;
  tx1 = t1[0];
  ty1 = t1[1];
  tx2 = t2[0];
  ty2 = t2[1];
  tx3 = t3[0];
  ty3 = t3[1];
  if (x2 < x1)
  {
    var tmpx = x2;
    x2 = x1;
    x1 = tmpx;
    var tmpy = y2;
    y2 = y1;
    y1 = tmpy;
    var tmptx = tx2;
    tx2 = tx1;
    tx1 = tmptx;
    var tmpty = ty2;
    ty2 = ty1;
    ty1 = tmpty;
  }
  var dx = x2 - x1;
  var dy = y2 - y1;
  var dz = z2 - z1;
  var tdx = tx2-tx1;
  var tdy = ty2-ty1;
  var fact = tdx/dx;
  var off = tx1-(fact*x1);
  for (var x=x1; x <= x2; x+=1)
  {
    var y = y1 + dy * (x - x1) / dx;
    var z = z1 + dz * (x - x1) / dx;
    var tx = off+x*fact;
    var ty = ty1 + tdy * (tx - tx1) / tdx;
    var tb = [tx, ty];
    drawLine(x, y, z, x3, y3, z3, tb[0], tb[1], t3[0], t3[1]);
  }
}

function drawLine(x1, y1, z1, x2, y2, z2, tx1, ty1, tx2, ty2)
{
  if (x2 < x1)
  {
    var tmpx = x2;
    x2 = x1;
    x1 = tmpx;
    var tmpy = y2;
    y2 = y1;
    y1 = tmpy;
    var tmptx = tx2;
    tx2 = tx1;
    tx1 = tmptx;
    var tmpty = ty2;
    ty2 = ty1;
    ty1 = tmpty;
  }
  var dx = x2 - x1;
  var dy = y2 - y1;
  var dz = z2 - z1;
  var tdx = tx2-tx1;
  var tdy = ty2-ty1;
  var fact = tdx/dx;
  var off = tx1-(fact*x1);
  for (var x=x1; x <= x2; x+=0.5)
  {
    var y = y1 + dy * (x - x1) / dx;
    var z = z1 + dz * (x - x1) / dx;
    var tx = off+x*fact;
    var ty = ty1 + tdy * (tx - tx1) / tdx;
    drawPoint(x, y, z, tx, ty);
  }
}

function drawPoint(x, y, z, tx, ty) {
  var color = getTex(tx, ty);
  x = Math.round(x);
  y = Math.round(y);
  var zidx = y*cnv.width+x;
  var bz = window.ZBuffer[zidx];
  if (bz === "-")
  {
    window.ZBuffer[zidx] = z;
  }
  else if (bz > z)
  {
    window.ZBuffer[zidx] = z;
  }
  else
  {
    return;
  }
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(x,y);
  ctx.lineTo(x+1,y+1);
  ctx.stroke();
}

function getTex(x, y) {
  var x = Math.floor(x);
  var y = Math.floor(y);
  var idx = (y*window.TEX_DATA.width+x)*4;
  var r = window.TEX_DATA.data[idx];
  var g = window.TEX_DATA.data[idx+1];
  var b = window.TEX_DATA.data[idx+2];
  return "rgba("+r+","+g+","+b+",1)";
}

function drawZBuffer() {
  for (var x=0;x<cnv.width;x++)
  {
    for (var y=0;y<cnv.height;y++)
    {
      var color = "#ff00ff";
      var zidx = y*cnv.width+x;
      var z = window.ZBuffer[zidx];
      if(z != "-")
      {
        var z = z % 255;
        color = "rgba(255,"+z+",0,1)";
        if (z === undefined)
          color = "#0000ff";
      }
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(x,y);
      ctx.lineTo(x+1,y+1);
      ctx.stroke();
    }
  }
}
