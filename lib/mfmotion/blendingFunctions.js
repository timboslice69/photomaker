function blendLastFrame() {
	// get webcam image data
	var sourceData = contextSource.getImageData(0, 0, canvasWidth, canvasHeight);
	// create an image if the previous image doesn’t exist
	if (!lastImageData) lastImageData = contextSource.getImageData(0, 0, canvasWidth, canvasHeight);
	// create a ImageData instance to receive the blended result
	var blendedData = contextSource.createImageData(canvasWidth, canvasHeight);
	// blend the 2 images
	differenceAlpha(blendedData.data, lastImageData.data, sourceData.data);
	// draw the result in a canvas
	contextBlended.putImageData(blendedData, 0, 0);
	// store the current webcam image
	lastImageData = sourceData;
}