getAuth = function(user){
	
	if(SUsers.findOne({userid: user._id})){ 
		
		return true;		
	}else{
		throw new Meteor.Error(500, "no permission");
		return false;
	}
	
}

//osc variables
var osc, dgram, udp, outport, inport, sock;

Meteor.publish('clamourData', function(){ return clamourData.find({}); });
Meteor.publish('SUsers', function(user){ 

	if(getAuth(user)){
		return SUsers.find({}); 
	}else{
		return false;
	};
											
});
				
Meteor.publish('allPlayers', function(user){ 
	if(getAuth(user)){
		return Meteor.users.find({});	
	}
});

Meteor.publish('userData', function(){ return userData.find({})});

Meteor.startup(function(){

	if(SUsers.find({}).count() == 0){
		//create an admin
		Accounts.createUser({username: "clamourAdmin", password: 'magicRibbons'});
		var user = Meteor.users.findOne({username: "clamourAdmin"});
		SUsers.insert({userid: user._id});
		Meteor.users.update(user._id, {$set: {'profile.admin':true}});
		console.log("new admin created");	
		return true;	
	}

	
	//setup the osc
	
	osc = Meteor.require('osc-min');
	dgram = Meteor.require ('dgram')
	udp = dgram.createSocket('udp4')
	outport = 41234;
	inport = 42345;
	
	sock = dgram.createSocket('udp4', function(msg, rinfo) {
	
		
		parseIncomingOsc(osc.fromBuffer(msg));
		
			
	
	});
	
	sock.bind(inport);
	
	//clean up inactive users
	
	Meteor.setInterval(function(){
	
		var t_users = Meteor.users.find({});
		
		var d = new Date();		
		
		t_users.forEach(function(user){
		
			if(user.profile.isActive){
			
				if(user.profile.prevTS < d.getTime() - tsInterval * 2){
					Meteor.users.update(user._id, {$set: {'profile.isActive': false}});
				}
				
			}else{
			
				if(user.profile.prevTS >= d.getTime() - tsInterval * 2){
					Meteor.users.update(user._id, {$set: {'profile.isActive': true}});
				}
			
			}
		})
	
	}, tsInterval);
	

});


Meteor.methods({


	resetDataBases:function(user){
		
		if(getAuth(user)){
		
			console.log('reset');
			//repopulate clamourData

			clamourData.remove({});
			clamourData.insert({item: 'numSeats', value: numSeats});
			clamourData.insert({item: 'numRows', value: numRows});
	
			//repopulate users
			
			Meteor.users.remove({_id: {$ne: user._id}}); // remove everyone except admin
			userData.remove({});
		
			for(var s = 0; s < numSeats; s++){
				for(var r = 0; r < numRows; r++){
					
					var row = String.fromCharCode(r + 65);
					var seat = String(s + 1);
				
					var id = Accounts.createUser({username:  row + "_" + seat, 
										password: '1234',
										profile: {isActive: false, devId: null, prevTS: 0, admin: false, row: row, seat: seat},	
										});
										
					userData.insert({id: id, currentRow: row, currentSeat: seat, displayType: 0});
				
				}
			}

			
			
		}
	
	},
	
	
	checkPlayerFree: function(un, devId){
	
		var user = Meteor.users.findOne({username: un});
		
		if(!user.profile.isActive || (user.profile.isActive && devId == user.profile.devId) || user.profile.devId == null){
			
			return true;
				
		}else{
			
			//error message
			throw new Meteor.Error(500, "Another device is currently logged in for this seat number. Are you sure you have entered the correct details ?");
			return false;
		
		}
	
	},

	timeStamp: function(user, devId){
		var d = new Date();
		Meteor.users.update(user._id, {$set: {'profile.devId' : devId, 
											'profile.isActive': true, 
											'profile.prevTS': d.getTime()
											}
									}
							);
	
	},

	

	start: function() {
  
	  var buf;
	  console.log("sending message ...");

	  buf = osc.toBuffer({
				address: "/start",
	  });
  
	  return udp.send(buf, 0, buf.length, outport, "localhost");
	},
	
	stop: function() {
  
	  var buf;
	  console.log("sending message ...");

	  buf = osc.toBuffer({
				address: "/stop",
	  });
  
	  return udp.send(buf, 0, buf.length, outport, "localhost");
	},
	
	sendCoordinate: function(x, y) {
  
	  var buf;

	  buf = osc.toBuffer({
				address: "/mouse/position",
				args: [x,y]
	  });
  
	  return udp.send(buf, 0, buf.length, outport, "localhost");
	}
	
});


parseIncomingOsc = function(msg){

		try{
			
			//do stuff to parse here
		
			return console.log(msg);
		}catch(err){
			console.log('invalid incoming OSC message');
		}

}