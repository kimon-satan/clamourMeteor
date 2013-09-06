var x = 0, y = 0;

var setupKinetic = function(){

	var stage, shapeLayer, sendOn, sendOff, isDown = false;
	
	stage = new Kinetic.Stage({
	
		container: 'canvasDiv',
		width: 640 ,
		height: 480 
		
	});
	

	shapeLayer = new Kinetic.Layer();
	
	
	var mRect = new Kinetic.Rect({
		x: 0,
		y: 0,
		width: stage.getWidth(),
		height: stage.getHeight(),
		fill: 'white',
		stroke: 'black',
		strokeWidth: 2
		
	 });
	 
	 var mCircle = new Kinetic.Circle({
	 	x: stage.getWidth() /2,
	 	y: stage.getHeight() /2,
	 	fill: 'none',
	 	radius: 80,
	 	draggable: true
	 });
	
	
	var startGesture = function(x, y){
	
		mRect.setFill('grey');
		mCircle.setFill('red');
		
		stage.draw();
		
		isDown = true;
	
		var r = Meteor.user().profile.row;
		var s = parseInt(Meteor.user().profile.seat);
		var d = new Date();
		
		sendOn = setInterval(function(){
			
			Meteor.call('sendNodeOn', r , s , d.getTime(), x, y, function(err, res){
				clearInterval(sendOn);
			});
		},100);
		
		
	};
	
	
	mRect.on('mousedown',function(){
	
		if(!isDown){
		
			var mousePos = stage.getMousePosition();
			mCircle.setX(mousePos.x);
			mCircle.setY(mousePos.y);
			shapeLayer.add(mCircle);
			startGesture(mousePos.x, mousePos.y);
			
			mCircle.fire('mousedown');
		
		}
		
	});
	
	mRect.on('touchstart',function(){
	
		if(!isDown){
		
			var touchPos = stage.getTouchPosition();
			mCircle.setX(touchPos.x);
			mCircle.setY(touchPos.y);
			shapeLayer.add(mCircle);
			
			startGesture(touchPos.x, touchPos.y);
			
			mCircle.fire('mousedown'); //check this works
		}
		
	});
	
	mCircle.on('dragmove', function(){
	
		if(isDown){
			var mousePos = mCircle.getPosition();
			x = mousePos.x;
			y = mousePos.y;
			mCircle.setX(x);
			mCircle.setY(y);
			Meteor.call('updateNode', Meteor.user().profile.row, parseInt(Meteor.user().profile.seat), x , y);
			
		
		}
	});
	
	
	mCircle.on('dragend mouseup touchend',function(){
		
		if(isDown){
			mRect.setFill('white');
			mCircle.setFill('none');
			var r = Meteor.user().profile.row;
			var s = parseInt(Meteor.user().profile.seat);
			var d = new Date();
			
			sendOff = setInterval(function(){
				
				Meteor.call('sendNodeOff', r, s, d.getTime(), x, y, function(){
					clearInterval(sendOff);
				});
			},100);
			isDown = false;
			mCircle.remove();
			stage.draw();
		}
		
		
	});
	
	
	shapeLayer.add(mRect);
	stage.add(shapeLayer);

   

};

var boundFunction = Meteor.bindEnvironment(setupKinetic, function(e){throw e});


Template.XYPad.created = function(){
	
	$.getScript("lib/kinetic-v4.6.0.min.js", function(){

	   boundFunction();

	});	

};



Template.XYPad.events({

	

});

