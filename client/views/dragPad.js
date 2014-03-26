var x = 0, y = 0, sw = 400, sh = 255;

var setupDragOnOff = function(){

	var stage, shapeLayer, sendOn, sendOff, isDown = false, prevUpdate = 0;
	
	

	stage = new Kinetic.Stage({
	
		container: 'canvasDiv',
		width:  sw ,
		height:  sh
		
	});
	

	shapeLayer = new Kinetic.Layer();
	
	
	var mRect = new Kinetic.Rect({
		x: 0,
		y: 0,
		width: stage.getWidth(),
		height: stage.getHeight(),
		fill: 'none',
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
		
		if(clamourData.findOne({item: 'clientOut'}).value){
		
			clearInterval(sendOn);
			var ctrlIndex = UserData.findOne({id: Meteor.user()._id}).ctrlIndex;
			sendOn = setInterval(function(){
				
				var counter = 0;
				Meteor.call('sendNodeOn', r , s , ctrlIndex, d.getTime(), x, y, "drag", function(err, res){
					clearInterval(sendOn);
				});
				counter += 1;
				if(counter > 10)clearInterval(sendOn);
				
			},100);
		
		}
		
		
	};
	
	
	mRect.on('mousedown',function(){
	
		if(!isDown){
		
			var mousePos = stage.getMousePosition();
			mCircle.setX(mousePos.x);
			mCircle.setY(mousePos.y);
			shapeLayer.add(mCircle);
			startGesture(mousePos.x/stage.getWidth(), mousePos.y/stage.getHeight());
			
			mCircle.fire('mousedown');
		
		}
		
	});
	
	mRect.on('touchstart',function(){
	
		if(!isDown){
		
			var touchPos = stage.getTouchPosition();
			mCircle.setX(touchPos.x);
			mCircle.setY(touchPos.y);
			shapeLayer.add(mCircle);
			
			startGesture(touchPos.x/stage.getWidth(), touchPos.y/stage.getHeight());
			
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
			var d = new Date().getTime();
			
			
			if(clamourData.findOne({item: 'clientOut'}).value){
				
				if(d > prevUpdate + 50){
				
					prevUpdate = d;
					ctrlIndex = UserData.findOne({id: Meteor.user()._id}).ctrlIndex;
				
					Meteor.call('updateNode', Meteor.user().profile.row, parseInt(Meteor.user().profile.seat), ctrlIndex,
					x/stage.getWidth() , 
					y/stage.getHeight(),
					"drag");
				}
			
			}
		
		}
	});
	
	
	mCircle.on('dragend mouseup touchend',function(){
		
		if(isDown){
			mRect.setFill('none');
			mCircle.setFill('none');
			var r = Meteor.user().profile.row;
			var s = parseInt(Meteor.user().profile.seat);
			var d = new Date();
			
			
			if(clamourData.findOne({item: 'clientOut'}).value){
				
				var ctrlIndex = UserData.findOne({id: Meteor.user()._id}).ctrlIndex;
				clearInterval(sendOff);
				sendOff = setInterval(function(){
					var counter;
					Meteor.call('sendNodeOff', r, s, ctrlIndex, d.getTime(), function(){
						clearInterval(sendOff);
					});
					if(counter >= 10)clearInterval(sendOff);
				},100);
			
			}
			isDown = false;
			mCircle.remove();
			stage.draw();
		}
		
		
	});
	
	
	shapeLayer.add(mRect);
	stage.add(shapeLayer);

   

};

var setupDragCont = function(){

	var stage, shapeLayer, isDown = false, sendStartD, sendDragOff, ctrlIndex;
	ctrlIndex = UserData.findOne({id: Meteor.user()._id}).ctrlIndex;
	
	stage = new Kinetic.Stage({
	
		container: 'canvasDiv',
		width: 400 ,
		height:  225
		
	});
	

	shapeLayer = new Kinetic.Layer();
	
	
	var mRect = new Kinetic.Rect({
		x: 0,
		y: 0,
		width: stage.getWidth(),
		height: stage.getHeight(),
		fill: 'grey',
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
	
		var r = Meteor.user().profile.row;
		var s = parseInt(Meteor.user().profile.seat);
		var d = new Date();
		
		if(clamourData.findOne({item: 'clientOut'}).value){
		
			sendStartD = setInterval(function(){
			
				Meteor.call('sendStartDrag', r , s , ctrlIndex, d.getTime(), x, y, "drag", function(err, res){
					clearInterval(sendStartD);
				});
			},100);
		
		}
		
		isDown = true;
		
		
	};
	
	
	mRect.on('mousedown',function(){
	
		if(!isDown){
		
			var mousePos = stage.getMousePosition();
			mCircle.setX(mousePos.x);
			mCircle.setY(mousePos.y);
			shapeLayer.add(mCircle);
			startGesture(mousePos.x/stage.getWidth(), mousePos.y/stage.getHeight());
			
			mCircle.fire('mousedown');
		
		}
		
	});
	
	mRect.on('touchstart',function(){
	
		if(!isDown){
		
			var touchPos = stage.getTouchPosition();
			mCircle.setX(touchPos.x);
			mCircle.setY(touchPos.y);
			shapeLayer.add(mCircle);
			
			startGesture(touchPos.x/stage.getWidth(), touchPos.y/stage.getHeight());
			
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
			
			if(clamourData.findOne({item: 'clientOut'}).value){
				Meteor.call('updateNode', Meteor.user().profile.row, parseInt(Meteor.user().profile.seat), ctrlIndex, 
				x/stage.getWidth() , 
				y/stage.getHeight(),
				"drag_c");
			}
		
		}
	});
	
	
	mCircle.on('dragend mouseup touchend',function(){
		
		if(isDown){
			mCircle.setFill('none');
			
		
			isDown = false;
			mCircle.remove();
			stage.draw();
			
			var r = Meteor.user().profile.row;
			var s = parseInt(Meteor.user().profile.seat);
			var d = new Date();
			
			if(clamourData.findOne({item: 'clientOut'}).value){
			
				sendDragOff = setInterval(function(){
				
					Meteor.call('sendDragOff', r, s, ctrlIndex, d.getTime(), function(){
						clearInterval(sendDragOff);
					});
			
				},100);
			}
		}
		
		
	});
	
	
	shapeLayer.add(mRect);
	stage.add(shapeLayer);

   

};

var boundOnOff = Meteor.bindEnvironment(setupDragOnOff, function(e){throw e});
var boundCont = Meteor.bindEnvironment(setupDragCont, function(e){throw e});



Template.DragOnOff.created = function(){
	

	$.getScript("lib/kinetic-v4.6.0.min.js", function(){
	
		isKineticLoaded = true;
	   boundOnOff();

	});	

	

};

Template.DragCont.created = function(){
	

	$.getScript("lib/kinetic-v4.6.0.min.js", function(){
	
	   boundCont();

	});	



};




