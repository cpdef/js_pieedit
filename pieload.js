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
				idx = 0;
				// animation or normal?
				flag = Number(cols[idx]);
				idx++;
				console.log(flag);
				num_points = Number(cols[idx]);
				idx++;
				console.log(num_points);
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
					polygon_obj.texture_points[j] = [x, y];
				}
				LEVELS[LEVEL].polygons[polygon] = polygon_obj;
				polygon++;
				if (polygon >= POLYGONS)
					block = "toplevel";
			}
		}
	}
	console.log("PIE: "+PIE)
	console.log("LEVELS: "+JSON.stringify(LEVELS))
	window.LEVELS = LEVELS;
	window.PIE = PIE;
}
