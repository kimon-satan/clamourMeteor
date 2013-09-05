var x = 0, y = 0;

var setupKinetic = function(){

	var stage, shapesLayer, sendOn, sendOff, isDown = false;
	
	stage = new Kinetic.Stage({
	
		container: 'canvasDiv',
		width: 900,
		height: 600
		
	});

	rectLayer = new Kinetic.Layer();
	
	var mRect = new Kinetic.Rect({
		x: 20,
		y: 20,
		width: stage.getWidth() - 40,
		height: stage.getHeight() -40,
		fill: 'white',
		stroke: 'black',
		strokeWidth: 2
	 });
	
	mRect.on('mousedown touchstart', function() {
		
		if(!isDown){
			this.setFill('grey');
			var r = Meteor.user().profile.row;
			var s = Meteor.user().profile.seat;
			sendOn = setInterval(function(){
				var d = new Date();
				Meteor.call('sendNodeOn', r , s , d.getTime(), x, y, function(err, res){
					clearInterval(sendOn);
				});
			},100);
			isDown = true;
			rectLayer.draw();
		}
		
	});
	
	mRect.on('mouseup touchend mouseout touchout', function() {
		
		if(isDown){
			this.setFill('white');
			var r = Meteor.user().profile.row;
			var s = Meteor.user().profile.seat;
			sendOff = setInterval(function(){
				var d = new Date();
				Meteor.call('sendNodeOff', r, s, d.getTime(), x, y, function(){
					clearInterval(sendOff);
				});
			},100);
			isDown = false;
			rectLayer.draw();
		}
		
	});
	
	
	mRect.on('mousemove', function() {
		
		if(isDown){
			var mousePos = stage.getMousePosition();
			x = mousePos.x;
			y = mousePos.y;
			Meteor.call('updateNode', Meteor.user().row, Meteor.user().seat,  x ,y);
		}
		

	});
	
	mRect.on('touchmove', function() {
	
		if(isDown){
			var touchPos = stage.getMousePosition();
			x = touchPos.x;
			y = touchPos.y;
			Meteor.call('updateNode', Meteor.user().row, Meteor.user().seat,  x ,y);
		}
		
	});


	
	rectLayer.add(mRect);
	

	stage.add(rectLayer);
   

};

var boundFunction = Meteor.bindEnvironment(setupKinetic, function(e){throw e});


Template.XYPad.created = function(){
	
	$.getScript("lib/kinetic-v4.6.0.min.js", function(){

	   boundFunction();

	});	

};



Template.XYPad.events({

	

});

