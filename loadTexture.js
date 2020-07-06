    function displayTexture(polys=false) {
      var radios = document.getElementsByName("texture");
      for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
          var value = radios[i].value;
          if (value === "File")
            texture_from_file(polys);
          else if (value === "Github")
            texture_from_github(polys);
          else if (value === "URL")
            texture_from_url(polys);
          else
            alert("not implemented yet!");
        }
      }
    }
    function texture_from_file(polys=false) {
        var ctx = document.getElementById('cnv-texture').getContext('2d');
        var file = document.getElementById('file').files[0];
        var img = new Image();
        var reader  = new FileReader();
        reader.onload = function(e)  {
            img.src = e.target.result;
            ctx.drawImage(img, 0, 0);
            if (polys)
              draw_2d_polys();
         }
         reader.readAsDataURL(file);
    }
    function texture_from_github(polys=false) {
        var ctx = document.getElementById('cnv-texture').getContext('2d');
        //var image = document.getElementById('texture_image');
        var img = new Image();
        img.src = "https://raw.githubusercontent.com/Warzone2100/data-texpages/master/"+window.TEXTURE;
        img.onload = function () {
          ctx.drawImage(img, 0, 0);
          if (polys)
            draw_2d_polys();
        }
    }
    function texture_from_url(polys=false) {
        var ctx = document.getElementById('cnv-texture').getContext('2d');
        var src = document.getElementById('texture_URL').value;
        var img = new Image();
        img.src = src;
        img.onload = function () {
          ctx.drawImage(img, 0, 0);
          if (polys)
            draw_2d_polys();
        }
    }
    function draw_2d_polys() {
        console.log("draw 2d polys")
        var LEVELS = window.LEVELS;
        var ctx = document.getElementById('cnv-texture').getContext('2d');
        for (var level=0; level < LEVELS.length; level++)
        {
          var polygons = LEVELS[level].polygons;
          for (var poly=0; poly < polygons.length; poly++)
          {
            var points = polygons[poly].texture_points;
            var last_point = points[points.length-1];
            var scale = 1024;
            if (window.PIE === 2)
              scale = 4;
            ctx.beginPath();
            ctx.moveTo(last_point[0]*scale, last_point[1]*scale);
            for (var point=0;point < points.length; point++)
              ctx.lineTo(points[point][0]*scale, points[point][1]*scale);
            ctx.strokeStyle = '#ff00ff'
            ctx.stroke();
          }
        }
    }
