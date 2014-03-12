(function(){

	var	canvas,
		context,
		canvasWidth,
		canvasHeight,
		video,
		$video,
		videoScaledWidth,
		videoScaledHeight,
		videoWidth,
		videoHeight,
		videoScaleX,
		videoScaleY,
		theInterval,
		smoother,
		rand;

	function resizeCanvas(){
		//canvasWidth = canvas.width = window.innerWidth;
		//canvasHeight = canvas.height = window.innerHeight;

		videoWidth = $video.width();
		videoHeight = $video.height();

		canvasWidth = canvas.width = videoWidth;
		canvasHeight = canvas.height = videoHeight;

		videoScaleX = (canvasWidth / videoWidth);
		videoScaleY = (canvasHeight / videoHeight);

		videoScaledWidth = videoWidth * videoScaleY;
		videoScaledHeight = videoHeight * videoScaleX;

		//console.log([canvasWidth,canvasHeight, videoWidth, videoHeight, videoScale]);

	}

	function gumFailure(){
		console.log('webkitGetUserMedia failure');
	}

	function gumSuccess(stream){
		video.src = webkitURL.createObjectURL(stream);
		resizeCanvas();
		startInterval();
	}

	function stopInterval(){
		console.log('stop interval');
		clearInterval(theInterval);
	}

	function startInterval(){
		console.log('start interval');
		theInterval = setInterval(detect, 1000/5);
	}

	function detect(){
		rand = Math.random();
		context.drawImage(video, 0, 0, canvasWidth, videoScaledHeight);
		context.strokeStyle = '#f00';
		context.fillStyle = '#f00';
		context.fillRect(10, 10, 10 * rand, 10 * rand);
		if (video.readyState === video.HAVE_ENOUGH_DATA) {
			$video.objectdetect("all", {scaleMin: 3, scaleFactor: 1.1, classifier: objectdetect.handopen}, function(coords) {
				if (coords[0]) {
					coords = smoother.smooth(coords[0]);
					//coords = coords[0];

					context.strokeRect(coords[0], coords[1], coords[2], coords[3]);

					console.log(coords);

/*
					$("#glasses").css({
						"left":    ~~(coords[0] + coords[2] * 1.0/8 + $(video).offset().left) + "px",
						"top":     ~~(coords[1] + coords[3] * 0.8/8 + $(video).offset().top) + "px",
						"width":   ~~(coords[2] * 6/8) + "px",
						"height":  ~~(coords[3] * 6/8) + "px",
						"display": "block"
					});
*/
				}
			});
		}


	}

	$(window).load(function(){
		smoother = new Smoother(0.85, [0, 0, 0, 0, 0]);

		canvas = document.getElementById('canvas');
		context = canvas.getContext('2d');

		context.strokeStyle = '#f00';
		context.lineWidth = 10;

		video = document.getElementById('video');
		$video = $(video);

		resizeCanvas();
		window.addEventListener('resize', resizeCanvas, true);

		$('#stop').bind('click', stopInterval);
		$('#go').bind('click', startInterval);

		navigator.webkitGetUserMedia({video:true},gumSuccess, gumFailure);

	});

})();