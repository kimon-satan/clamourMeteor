getAuth = function(user){
	
	if(SUsers.findOne({userid: user._id})){ 
		
		return true;		
	}else{
		throw new Meteor.Error(500, "no permission");
		return false;
	}
	
}

//osc variables
var osc, dgram, udp, outport, inport, sock, nodes;

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

Meteor.publish('userData', function(){ return UserData.find({});});

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
	
	//wraps the socket in Meteor 
	
	var boundReceiver = Meteor.bindEnvironment(function(msg, rinfo) {
		
		parseIncomingOsc(osc.fromBuffer(msg));
	
	},function(e){ throw e});
	
	sock = dgram.createSocket('udp4', boundReceiver);
	
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
	
	nodes = {};
	
	for(var s = 0; s < numSeats; s++){
			for(var r = 0; r < numRows; r++){
			
			var name = String.fromCharCode(r + 65) + "_" + String(s + 1);
			nodes[name] = {isOn: false, isFlagged: false, prevMsg: null};	
			
		}
	}
	
	

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
			UserData.remove({});
		
			for(var s = 0; s < numSeats; s++){
				for(var r = 0; r < numRows; r++){
					
					var row = String.fromCharCode(r + 65);
					var seat = String(s + 1);
				
					var id = Accounts.createUser({username:  row + "_" + seat, 
										password: '1234',
										profile: {isActive: false, devId: null, prevTS: 0, admin: false, row: row, seat: seat},	
										});
										
					UserData.insert({id: id, currentRow: row, currentSeat: seat, displayType: 0});
				
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
	
	
	sendNodeOn: function(row, seat, ts, x, y) {
  
	  var buf;
	  var index = row + '_' + seat;
	  
	  buf = osc.toBuffer({
		address: "/node/on",
		args: [row, seat]
	  });
	  
	  //delayed message handling
	 console.log("nodeOn: " + index + " ts: " + ts)
	 
	  if(!nodes[index].isOn){
	  	 //actually an extra case for unresolved offs is needed
	  	 nodes[index].isOn = true;
	  	 return udp.send(buf, 0, buf.length, outport, "localhost");
	  }else{
	  	
	  	if(nodes[index].isFlagged){
	  	
	  		if(nodes[index].prevMsg.ts < ts){
	  			//prevMsg is older
	  			return udp.send(buf, 0, buf.length, outport, "localhost");
	  		}else{
	  			//prevMsg is younger
	  			//resolve
	  			nodes[index].isFlagged = false;
	  			nodes[index].prevMsg = null;
	  		}
	  		
	  	}else{
	  	
	  		//flag n store
	  		nodes[index].isFlagged = true;
	  		nodes[index].prevMsg = {msg: 'on', ts: ts}; //replace with client TS
	  		
	  	}
	  
	  }
	  
	  return true;
	  

	},
	
	sendNodeOff: function(row, seat, ts, x, y) {
  
	  var buf;
	  var index = row + '_' + seat;
	  
	  buf = osc.toBuffer({
				address: "/node/off",
				args: [row, seat]
	  });
  
	  
	  //delayed message handling
	  console.log("nodeOff: " + index + " ts: " + ts);
	 
	  if(nodes[index].isOn){
	  	 //actually an extra case for unresolved ons is needed
	  	 nodes[index].isOn = false;
	  	 return udp.send(buf, 0, buf.length, outport, "localhost");
	  }else{
	  	
	  	if(nodes[index].isFlagged){
	  	
	  		if(nodes[index].prevMsg.ts < ts){
	  			//prevMsg is older
	  			//resolve
	  			nodes[index].isFlagged = false;
	  			nodes[index].prevMsg = null;
	  		
	  		}else{
	  			//prevMsg is younger
	  			return udp.send(buf, 0, buf.length, outport, "localhost");
	  		}
	  		
	  	}else{
	  	
	  		//flag n store
	  		nodes[index].isFlagged = true;
	  		nodes[index].prevMsg = {msg: 'off', ts: ts}; //replace with client TS
	  		
	  	}
	  
	  }
	  
	},
	
	updateNode: function(row, seat, x, y) {
  
	  var buf;

	  buf = osc.toBuffer({
				address: "/node/position",
				args: [row, seat, x,y]
	  });
  
	  return udp.send(buf, 0, buf.length, outport, "localhost");
	}
	
});



parseIncomingOsc = function(msg){
		
	
	//parse the address
	var add_str = msg.elements[0].address.substr(1);
	var add_array = add_str.split('/');
	var arg_array = msg.elements[0].args;
	
	if(add_array[0] == 'allClients'){
	
		if(add_array[1] == 'newControl'){
			
			var nc_index = arg_array[0].value;
			
			
			if(nc_index == 0){
				//var nc_text =  ;
				UserData.update({}, {$set: {displayType: nc_index, displayText: arg_array[1].value}}, {multi: true});
			}else{
				UserData.update({}, {$set: {displayType: nc_index}}, {multi: true});
			}
			
			console.log('all clients to display: ' + nc_index);
		}
	}
	
	
	
	

}

