
function differenceSimple(target, data1, data2) {
	// blend mode difference
	if (data1.length != data2.length) return null;
	var	i = 0,
		px = 0;
	while (i < (data1.length * 0.25)) {
		px = 4*i;
		target[px] = data1[px] == 0 ? 0 : fastAbs(data1[px] - data2[px]);
		target[px+1] = data1[px+1] == 0 ? 0 : fastAbs(data1[px+1] - data2[px+1]);
		target[px+2] = data1[px+2] == 0 ? 0 : fastAbs(data1[px+2] - data2[px+2]);
		target[px+3] = 255;
		i++;
	}
}

function differenceAccuracy(target, data1, data2) {
	if (data1.length != data2.length) return null;
	var i = 0,
		pxM = 4;
	while (i < (data1.length * ((100/pxM)/100))) {
		var average1 = (data1[pxM*i] + data1[pxM*i+1] + data1[pxM*i+2]) / 3;
		var average2 = (data2[pxM*i] + data2[pxM*i+1] + data2[pxM*i+2]) / 3;
		var diff = threshold(fastAbs(average1 - average2));
		target[pxM*i] = diff;	// red
		target[pxM*i+1] = diff;	// green
		target[pxM*i+2] = diff;	// blue
		target[pxM*i+3] = 255;	// alpha
		++i;
	}
}

