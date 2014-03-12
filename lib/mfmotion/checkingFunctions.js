
function checkAreas() {
	// draw scaled areas over blended canvas, this is for trouble shooting.
	//for (var c=0; c<nodes.length; c++) { contextBlended.fillRect(nodes[c].x, nodes[c].y, nodes[c].w, nodes[c].h); }

	// loop over the note areas
	for (var r=0; r<nodes.length; ++r) {

		// get the pixels in a node area from the blended image
		var	blendedData = contextBlended.getImageData(nodes[r].x, nodes[r].y, nodes[r].w, nodes[r].h),
			i = 0,
			average = 0;

		// loop over the pixels
		while (i < (blendedData.data.length / 4)) {
			// make an average between the color channel
			average += (blendedData.data[i*4] + blendedData.data[i*4+1] + blendedData.data[i*4+2]) / 3;
			++i;
		}
		// calculate an average between of the color values of the note area
		average = Math.round(average / (blendedData.data.length / 4));
		if (average > 10) {
			// over a small limit, consider that a movement is detected
			nodes[r].obj.not('.active').trigger('motionIn').trigger('activate');
		}
		else {
			nodes[r].obj.filter('.active').trigger('motionOut').trigger('deactivate');
		}
	}
}
