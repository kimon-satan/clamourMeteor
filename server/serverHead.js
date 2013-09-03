

//osc variables
var osc, dgram, udp, outport, inport, sock;

Meteor.publish('clamourData', function(){ return clamourData.find({}); });
Meteor.publish('players', function(){ return Meteor.users.find({}); }); //put an exclusion for admin user

Meteor.startup(function(){
	
	//setup the osc
	
	osc = Meteor.require('osc-min');
	dgram = Meteor.require ('dgram')
	udp = dgram.createSocket('udp4')
	outport = 41234;
	inport = 42345;
	
	sock = dgram.createSocket('udp4', function(msg, rinfo) {
	
		try{
			return console.log(osc.fromBuffer(msg));
		}catch(error){
			return console.log("invalid OSC packet");
		}
	
	});
	
	sock.bind(inport);
	
	//clean up inactive users
	
	Meteor.setInterval(function(){
	
		var t_users = Meteor.users.find({});
		
		var d = new Date();		
		
		t_users.forEach(function(user){
		
			if(user.profile.isActive){
			
				if(user.profile.prevTS < d.getTime() - 20000){
					console.log("reset" + user._id);
					Meteor.users.update(user._id, {$set: {'profile.isActive': false}});
					
				}
			}
		})
	
	}, 30000);
	

});


Meteor.methods({

	'resetDataBases':function(){
	
		//repopulate clamourData

		clamourData.remove({});
		clamourData.insert({item: 'numSeats', value: numSeats});
		clamourData.insert({item: 'numRows', value: numRows});
	
	
		//repopulate users
	
		Meteor.users.remove({});
		
		var d = new Date();
		
		for(var s = 0; s < numSeats; s++){
			for(var r = 0; r < numRows; r++){
			
				
				Accounts.createUser({username: String.fromCharCode(r + 65) + String(s + 1), 
									password: '1234',
									profile: {isActive: false, devId: null, prevTS: d.getTime()},	
									});
				
			}
		}
	
	
	},



	'start': function() {
  
	  var buf;
	  console.log("sending message ...");

	  buf = osc.toBuffer({
				address: "/start",
	  });
  
	  return udp.send(buf, 0, buf.length, outport, "localhost");
	},
	
	'stop': function() {
  
	  var buf;
	  console.log("sending message ...");

	  buf = osc.toBuffer({
				address: "/stop",
	  });
  
	  return udp.send(buf, 0, buf.length, outport, "localhost");
	},
	
	'sendCoordinate': function(x, y) {
  
	  var buf;

	  buf = osc.toBuffer({
				address: "/mouse/position",
				args: [x,y]
	  });
  
	  return udp.send(buf, 0, buf.length, outport, "localhost");
	}
	
});