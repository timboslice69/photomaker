/*  ================================================================================
 INIT
 ================================================================================  */
window.pixelRatio = window.devicePixelRatio || 1;
window.defaultAnimationDuration = 350;

var madeImage = false,
	generatedCanvas = {},
	backgrounds = [
		"/media/backgrounds/1.jpg",
		"/media/backgrounds/2.jpg"
	],
	backgroundImages = [];

function loadBackgrounds(){
	var images = [];

	for (var i = 0, l = backgrounds.length; i < l; i++) {
		images.push({
			obj: new Image,
			src: backgrounds[i]
		});

		images[i].obj.onload = function(){
			backgroundImages.push(this);
			console.log(backgroundImages);
		};
		images[i].obj.src = images[i].src;
	}
}

function getRandomBackground(){
	var rand = Math.floor(Math.random() * backgroundImages.length);
	return backgroundImages[rand];
}


/*  ================================================================================
 WINDOW LOAD
 ================================================================================  */
$(window).load(function(){



	window.theCapture = new MotionCapture({
				webcamVideo: document.getElementById('webcam'),
				captureFrameRate: 1,
				checkingFrameRate: 1,
				captureVideoScale: 0.6,
				pixelTolerance: 25,
				motionTolerance: 25,
				staticBackdrop: true,
				//sourceCanvas: 'theSource',
				//blendCanvas: 'theBlend',
				//backdropCanvas: 'theBackdrop',
				displayScale: 0.1,
				nodeSelector: '#masterView #captureArea',
				onStart: function(){console.log('start callback');},
				onStop: function(){console.log('stop callback');},
				onReady: function(mc){

					console.log(['ready', mc]);

					$('#masterView').css({
						height: mc.params.outputWebcamHeight,
						width: mc.params.outputWebcamWidth,
						marginLeft: mc.params.outputWebcamMargin
					});
					$('body').addClass('captureReady');

					setTimeout(function(){ mc.collectNodes(); }, 200);

					loadBackgrounds();

					generatedCanvas.canvas = document.getElementById('generatedPhoto');
					//generatedCanvas.canvas = document.createElement('canvas');
					generatedCanvas.ctx = generatedCanvas.canvas.getContext('2d');
					generatedCanvas.canvas.height = window.theCapture.params.canvasHeight;
					generatedCanvas.canvas.width = window.theCapture.params.canvasWidth;

					$('#reset').click(window.theCapture.setBackdrop);

					$('#captureArea').bind('motionOver',function(){
						if (!madeImage) {
							madeImage = true;
							generatedCanvas.ctx.drawImage(getRandomBackground(),0,0);
							generatedCanvas.ctx.drawImage(theCapture.blend.canvas,0,0);

							var imageData = generatedCanvas.canvas.toDataURL();

							$.ajax({
								url: '/create.php?name=' + new Date().getTime(),
								type: "POST",
								data: imageData,
								processData: false,
								success: function(){
									//console.log('sent');
								},
								failure: function(){
									//console.log('notsent');
								}
							})
							setTimeout(function(){ madeImage = false;}, 10000);
						}
					});



				}
			}
		),
		window.doingResetBackdrop = false;


});