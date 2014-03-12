/*  ================================================================================
 INIT
 ================================================================================  */
window.pixelRatio = window.devicePixelRatio || 1;
window.defaultAnimationDuration = 350;


/*  ===

/*  ================================================================================
 DOCUMENT READY
 ================================================================================  */
$(document).ready(function(){
});


/*  ================================================================================
 WINDOW LOAD
 ================================================================================  */
$(window).load(function(){

	$('#captureArea').bind('motionIn',function(){
		//alert('motion in');
	})

	window.theCapture = new MotionCapture({
				webcamVideo: document.getElementById('webcam'),
				captureFrameRate: 2,
				checkingFrameRate: 8,
				captureVideoScale: 0.1,
				pixelTolerance: 25,
				motionTolerance: 25,
				staticBackdrop: true,
				sourceCanvas: 'theSource',
				blendCanvas: 'theBlend',
				backdropCanvas: 'theBackdrop',
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
				}
			}
		),
		window.doingResetBackdrop = false;


	window.resetCapture = function($node, callback){
		if(!window.doingResetBackdrop){
			window.doingResetBackdrop = true;
			//var $counter = $('#resetCounter').addClass('active');
			//$counter.text(2);
			setTimeout(function(){
				//$counter.text(1)
			}, 1000);
			setTimeout(function(){
				//$counter.text(0);
				//$('#webcam').animate({opacity:0}, 50).animate({opacity:1}, 100);
				window.theCapture.setBackdrop();
				//$counter.removeClass('active');
				window.doingResetBackdrop = false;
				if(typeof(callback) == "function") { callback(); }
			}, 2000);
		}
	}


	$('#reset').bind(
		'motionIn',
		function(){
			resetCapture($(this), function(){ $screens.trigger('show', '#home');} );
		}
	);


});