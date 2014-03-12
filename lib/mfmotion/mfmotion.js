function MotionCapture(settings){
	var mc = this;

	if(typeof(settings.webcamVideo) == 'undefined'){
		console.log('MotionCapture: webcam object not provided');
		return {};
	}

	this.webcamVideo = settings.webcamVideo;

	this.defaults = {
		captureFrameRate: 25,
		checkingFrameRate: 5,
		captureVideoScale: 0.1,
		pixelTolerance: 25,
		motionTolerance: 10,
		displayScale: 1,
		staticBackdrop: true,
		onStart: null,
		onStop: null,
		onReady: null,
		resize: true
	};

	// create options from defaults and user settings
	this.options = $.extend({}, this.defaults, settings);
	this.params = {};

	// Source
	//this.source = this.createCanvasObject();
	this.source = (typeof(this.options.sourceCanvas) == 'string') ? this.getCanvasObject(this.options.sourceCanvas) : this.createCanvasObject();
	//this.sourceDisplay = (typeof(this.options.sourceDisplay) == 'string') ? this.getCanvasObject(this.options.sourceDisplay) : false;
	// Blend
	//this.blend = this.createCanvasObject();
	this.blend = (typeof(this.options.blendCanvas) == 'string') ? this.getCanvasObject(this.options.blendCanvas) : this.createCanvasObject();
	//this.blendDisplay = (typeof(this.options.blendDisplay) == 'string') ? this.getCanvasObject(this.options.blendDisplay) : false;
	// Backdrop
	//this.backdrop = this.createCanvasObject();
	this.backdrop = (typeof(this.options.backdropCanvas) == 'string') ? this.getCanvasObject(this.options.backdropCanvas) : this.createCanvasObject();
	//this.backdropDisplay = (typeof(this.options.backdropDisplay) == 'string') ? this.getCanvasObject(this.options.backdropDisplay) : this.createCanvasObject();

	this.intervals = {};
	this.lastImageData = null;
	this.nodes = [];

	if(this.options.resize){
		window.addEventListener(
			'resize',
			function(){ mc.resize(); },
			true
		);
		mc.resize();
	}
	// GO!
	navigator.webkitGetUserMedia({video:true}, function(stream){mc.getUserMediaSuccess(stream);}, function(){mc.getUserMediaFailure()});
}

MotionCapture.prototype = {
	getCanvasObject: function(id){
		var canvas = document.getElementById(id),
			ctx = canvas.getContext('2d');

		return {canvas: canvas, ctx: ctx};
	},
	createCanvasObject: function(){
		var canvas = document.createElement('canvas'),
			ctx = canvas.getContext('2d');

		return {canvas: canvas, ctx: ctx};
	},
	ready: function(){
		var mc = this;
		// execute the callback passing the MotionCapture object
		if(typeof(mc.options.onReady) == "function") { mc.options.onReady(mc); }
	},
	resize: function(){
		var webcamVideoWidth =  $(this.webcamVideo).width(),
			webcamVideoHeight =  $(this.webcamVideo).outerHeight();

		// Size canvas' according to captureVideoScale
		this.params.canvasWidth = this.source.canvas.width = this.backdrop.canvas.width = this.blend.canvas.width = webcamVideoWidth * this.options.captureVideoScale;
		this.params.canvasHeight = this.source.canvas.height = this.backdrop.canvas.height = this.blend.canvas.height = webcamVideoHeight  * this.options.captureVideoScale;

/*		this.params.displayCanvasWidth = webcamVideoWidth * this.options.displayScale;
		this.params.displayCanvasHeight = webcamVideoHeight  * this.options.displayScale;*/

		// Mirror the canvas'  //TODO: surely this can be in the init??
		// Source
		this.source.ctx.translate(this.params.canvasWidth, 0);
		this.source.ctx.scale(-1, 1);
		// Backdrop
		this.backdrop.ctx.translate(this.params.canvasWidth, 0);
		this.backdrop.ctx.scale(-1, 1);

		this.params.videoScale = window.innerWidth / webcamVideoWidth;

		console.log(['Resize',window.innerHeight, webcamVideoHeight, window.innerWidth, webcamVideoWidth, this.params.videoScale]);

		this.params.outputWebcamHeight = webcamVideoHeight;
		this.params.outputWebcamWidth = webcamVideoWidth * this.params.videoScale;
		this.params.outputWebcamMargin = (window.innerWidth - this.params.outputWebcamWidth) / 2;

		this.collectNodes();
	},
	setBackdrop: function(){
		var mc = this;
		mc.backdrop.ctx.drawImage(mc.webcamVideo, 0, 0, this.params.canvasWidth, this.params.canvasHeight);
		mc.backdropImageData = mc.backdrop.ctx.getImageData(0, 0, this.params.canvasWidth, this.params.canvasHeight);
		mc.doResetBg = false;
	},
	fastAbs: function(value) {
		// equivalent to Math.abs();
		return (value ^ (value >> 31)) - (value >> 31);
	},
	threshold: function (value) {
		return (value > this.options.pixelTolerance) ? 255 : 0;
	},
	differenceAlpha: function(target, data1, data2) {
		if (data1.length != data2.length) return null;
		var i = 0;

		while (i < (data1.length / 4)) {
			var average1 = (data1[4*i] + data1[4*i+1] + data1[4*i+2]) / 3;
			var average2 = (data2[4*i] + data2[4*i+1] + data2[4*i+2]) / 3;
			var diff = this.threshold(this.fastAbs(average1 - average2));
			target[4*i] = data2[4*i];				// red
			target[4*i+1] = data2[4*i+1];			// green
			target[4*i+2] = data2[4*i+2];			// blue
			target[4*i+3] = (diff == 0) ? 0 : 255;	// alpha
			++i;
		}
	},
	blendBackdrop: function() {
		var mc = this,
			// get webcam image data
			sourceData = this.source.ctx.getImageData(0, 0, this.params.canvasWidth, this.params.canvasHeight),
			// create a ImageData instance to receive the blended result
			blendedData = this.source.ctx.createImageData(this.params.canvasWidth, this.params.canvasHeight);

		// create an image if the previous image doesn’t exist
		if (!this.backdropImageData) this.setBackdrop();

		// blend the 2 images
		mc.differenceAlpha(blendedData.data, this.backdropImageData.data, sourceData.data);


		// draw the result in a canvas
		//mc.blend.ctx.putImageData(blendedData, 0, 0);
		mc.blend.ctx.putImageData(blendedData, 0, 0);
		if(!this.options.staticBackdrop) this.setBackdrop();
	},
	checkNodesAlpha: function(mc) {
		// loop over the node areas

		for (var r=0; r < mc.nodes.length; r++) {
			// get the pixels in a node area from the blended image
			var	blendedData = mc.blend.ctx.getImageData(mc.nodes[r].x, mc.nodes[r].y, mc.nodes[r].w, mc.nodes[r].h),
				i = 0,
				average = 0;

			// loop over the pixels
			while (i < (blendedData.data.length / 4)) {
				average += blendedData.data[4*i+3]; // // make an average of the alpha channel
				++i;
			}

			average = Math.round(average / (blendedData.data.length / 4)); // calculate an average between of the color values of the note area
			if (average > mc.options.motionTolerance) {
				mc.nodes[r].obj.not('[data-motion-active]').attr('data-motion-active','').trigger('motionIn');
				mc.nodes[r].obj.trigger('motionOver');
			}
			else {
				mc.nodes[r].obj.filter('[data-motion-active]').trigger('motionOut').removeAttr('data-motion-active');
			}
		}
	},
	capture: function (mc){
		// draw webcam source to canvas source
		mc.source.ctx.drawImage(mc.webcamVideo, 0, 0, mc.params.canvasWidth, mc.params.canvasHeight);
		// draw scaled areas over blended canvas, this is for trouble shooting.
		//mc.blend.ctx.fillStyle = "red";
		//for (var c=0; c < mc.nodes.length; c++) { mc.blend.ctx.fillRect(mc.nodes[c].x, mc.nodes[c].y, mc.nodes[c].w, mc.nodes[c].h); }

		// create blend
		mc.blendBackdrop();
	},
	getUserMediaFailure: function (){
		console.log('webkitGetUserMedia failure');
	},
	getUserMediaSuccess: function (stream){
		var mc = this;
		mc.webcamVideo.src = webkitURL.createObjectURL(stream);
		setTimeout(function(){
			mc.webcamVideoReady();
		}, 2000);
	},
	webcamVideoReady: function(){
		var mc = this;
		mc.resize();
		mc.setBackdrop();
		mc.collectNodes();
		mc.ready();
		mc.start();
	},
	stopCapturing: function (){
		clearInterval(this.intervals.capture);
	},
	startCapturing: function (){
		var mc = this;
		mc.intervals.capture = setInterval(function(){mc.capture(mc)}, 1000 / mc.options.captureFrameRate);
	},
	stopChecking: function(){
		clearInterval(this.intervals.checkAreas);
	},
	startChecking: function(){
		var mc = this;
		mc.intervals.checkAreas = setInterval(function(){mc.checkNodesAlpha(mc)}, 1000 / mc.options.checkingFrameRate);
	},
	stop: function(){
		var mc = this;

		mc.stopChecking();
		mc.stopCapturing();

		// execute the onStop callback passing the MotionCapture object
		if(typeof(mc.options.onStop) == "function") { mc.options.onStop.call(mc); }
	},
	start: function(){
		var mc = this;

		mc.startCapturing();
		mc.startChecking();

		// execute the onStop callback passing the MotionCapture object
		if(typeof(mc.options.onStart) == "function") { mc.options.onStart.call(mc); }
	},
	collectNodes: function(selector) {
		var mc = this;
			scaleFactor = mc.params.videoScale * mc.options.captureVideoScale;

		if(typeof(selector) == "undefined") selector = mc.options.nodeSelector;

		//Reset Nodes
		mc.nodes = [];

		$(selector).each(function(){
			mc.nodes.push({
				obj: $(this),
				x: $(this).position().left * scaleFactor,
				y: $(this).position().top * scaleFactor,
				w: $(this).outerWidth() * scaleFactor,
				h: $(this).outerHeight() * scaleFactor
			});
		});

		console.log(mc.nodes);
	},
	clearNodes: function(){
		this.nodes = [];
	}
}
