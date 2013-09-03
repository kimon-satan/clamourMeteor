var x = 0, y = 0;

var setupKinetic = function() {

	var stage, shapesLayer;

	stage = new Kinetic.Stage({
	
		container: 'container',
		width: 800,
		height: 480
		
	});

	shapesLayer = new Kinetic.Layer();
	
	var mCircle = new Kinetic.Circle({

		x: x,
		y: y,
		radius: 20,
		fill: 'red',
		stroke: 'black',
		strokeWidth: 4

	});

	var mRect = new Kinetic.Rect({
		x: 20,
		y: 20,
		width: stage.getWidth() - 40,
		height: stage.getHeight() -40,
		fill: '#00D2FF',
		stroke: 'black',
		strokeWidth: 2
	 });

	mRect.on('mousemove', function() {
	
		var mousePos = stage.getMousePosition();
		x = mousePos.x;
		y = mousePos.y;
		Session.set('coordinates', 'x: ' + Math.floor(x) + ', y: ' + Math.floor(y));
		Meteor.call('sendCoordinate',x,y);
		mCircle.setX(x);
		mCircle.setY(y);
		stage.draw();

	});

	mRect.on('touchmove', function() {
	
		var touchPos = stage.getTouchPosition();
		x = touchPos.x;
		y = touchPos.y;
		Session.set('coordinates', 'x: ' + Math.floor(x) + ', y: ' + Math.floor(y));
		Meteor.call('sendCoordinate',x,y);
		mCircle.setX(x);
		mCircle.setY(y);
		stage.draw();

	});


	shapesLayer.add(mRect);
	shapesLayer.add(mCircle);

	stage.add(shapesLayer);
   

};


Template.hello.created = function(){
	
	$.getScript("lib/kinetic-v4.6.0.min.js", function(){

	   setupKinetic();

	});
	
	

};


Template.hello.events({

	'click input.on' : function () {
		
		
		sendOn = setInterval(
		
			function(){
				Meteor.call('start', function(){
					window.clearInterval(sendOn);
				});
			}, 100
		
		);
			
	},
	
	'click input.off' : function () {
		
		sendOff = setInterval(
		
			function(){
				Meteor.call('stop', function(){
					window.clearInterval(sendOff);
				});
			}, 100
		
		);
			
	}
	

});

Template.coordbox.coordinates = function(){return Session.get('coordinates')};