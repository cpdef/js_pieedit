function reload_pie() {
	var InputText = document.getElementById('input');
	result_text = ''
	text = InputText.value;
//	text = text.replace(/	/g, " ");
	
	//parse:
	var block="toplevel"
	var PIE = 3;
	var LEVELS = []
	var LEVEL = -1;
	var POINTS = -1;
	var point = -1;
	var POLYGONS = -1;
	var polygon = -1;
	var ANIMFRAMES = -1;
	var animframe = -1;
	var CONNECTORS = -1;
	var connector = -1;
	lines = text.split("\n");
	for (var i=0; i < lines.length; i++)
	{
		var is_comment = false;
		if (lines[i][0] === "#")
			is_comment = true;
		cols = lines[i].split(" ")
		result_text += cols +";\n";
		if (cols.length < 2)
			continue;
		if (block === "toplevel")
		{
			if (is_comment)
				continue;
			block = cols[0];
			console.log(block);
		}
		if (block === "PIE")
		{
			PIE = Number(cols[1]);
			block = "toplevel";
		} else if (block === "TYPE")
		{
			block = "toplevel";
		} else if (block === "TEXTURE")
		{
			window.TEXTURE = cols[2];
			block = "toplevel";
		} else if (block === "LEVELS")
		{
			LEVELS = new Array(Number(cols[1]));
			block = "toplevel";
		} else if (block === "LEVEL")
		{
			LEVEL = cols[1]-1;
			LEVELS[LEVEL] = {};
			block = "toplevel";
		} else if (block === "POINTS")
		{
			if (cols[0] === "POINTS")
			{
				POINTS = Number(cols[1]);
				point = 0;
				LEVELS[LEVEL].points = new Array();
			} else {
				if (is_comment)
				{
					POINTS--; // decrease point number, else it would break
					continue;
				}
				LEVELS[LEVEL].points[point] = new Array(3);
				for (var j=0; j < 3; j++)
				{
					LEVELS[LEVEL].points[point][j] = Number(cols[j]);
				}
				point++;
				if (point >= POINTS)
					block = "toplevel";
			}
		} else if (block === "POLYGONS")
		{
			if (cols[0] === "POLYGONS")
			{
				POLYGONS = Number(cols[1]);
				polygon = 0;
				LEVELS[LEVEL].polygons = new Array();
			} else {
				if (is_comment)
				{
					POLYGONS--; // decrease poly number, else it would break
					continue;
				}
				var factor = 1024;
				if (PIE === 2)
				    factor = 4;
				idx = 0;
				// animation or normal?
				flag = Number(cols[idx]);
				idx++;
				num_points = Number(cols[idx]);
				idx++;
				var polygon_obj = {
					point_order: new Array(num_points),
					texture_points: new Array(num_points)
					// insert animation flags here
				}
				// get all points
				for (var j=0; j < num_points; j++)
				{
					polygon_obj.point_order[j] = Number(cols[idx]);
					idx++;
				}
				// ignore animation for now
				if (flag === 4200)
					idx+=4
				// save texture points
				for (var j=0; j < num_points; j++)
				{
					var x = Number(cols[idx]);
					idx++;
					var y = Number(cols[idx]);
					idx++;
					polygon_obj.texture_points[j] = [x*factor, y*factor];
				}
				LEVELS[LEVEL].polygons[polygon] = polygon_obj;
				polygon++;
				if (polygon >= POLYGONS)
					block = "toplevel";
			}
		} else if (block === "ANIMOBJECT")
		{
			if (cols[0] === "ANIMOBJECT")
			{
				ANIMFRAMES = Number(cols[3]);
				animframe = 0;
				LEVELS[LEVEL].animframes = new Array();
			} else {
				if (is_comment)
				{
					ANIMFRAMES--;
					continue
				}
				// add animations here
				animframe++;
				if (animframe >= ANIMFRAMES)
					block = "toplevel";
			}
		} else if (block === "CONNECTORS")
		{
			if (cols[0] === "CONNECTORS")
			{
				CONNECTORS = Number(cols[1]);
				connector = 0;
				LEVELS[LEVEL].connectors = new Array();
			} else {
				if (is_comment)
				{
					CONNECTORS--;
					continue
				}
				// add connectors here
				connector++;
				if (connector >= CONNECTORS)
					block = "toplevel";
			}
		}
	}
	console.log(LEVELS);
	window.LEVELS = LEVELS;
	window.PIE = PIE;
}
