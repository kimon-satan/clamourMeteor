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
	
	Meteor.setInterval(function(){
	
		var buf, onLineUsers = new Array(), count = 0;
		
		Meteor.users.find({'profile.isActive':true}).forEach(function(user){
		
			onLineUsers[count] = user.username;
			count += 1;
			
		});
		
		buf = osc.toBuffer({
			address: "/update/onlineUsers",
			args: onLineUsers
		});
		
		udp.send(buf, 0, buf.length, outport, "localhost");
		
	
	},10000);
	
	nodes = {};
	
	for(var s = 0; s < numSeats; s++){
			for(var r = 0; r < numRows; r++){
			
			var name = String.fromCharCode(r + 65) + "_" + String(s + 1);
			nodes[name] = {uname: name, isOn: false, isFlagged: false, prevMsg: null, flagMsg: null};	
			
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
										
					UserData.insert({uname: row + '_' +seat,  id: id, currentRow: row, currentSeat: seat, displayType: "BIG_TEXT", ctrlIndex: "aaaaa"});
				
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
		//console.log("TS: " + user.username)
	
	},
	
	sendStartDrag: function(row, seat, ctrlIndex, ts, x, y, type) {
  
	  var buf;
	  var index = row + '_' + seat;
	  
	  buf = osc.toBuffer({
		address: "/node/startDrag",
		args: [row, seat, ctrlIndex, x, y, type]
	  });
	  
	  //ignore repeat messages
	  try{
	  	if(nodes[index].prevMsg.ts >= ts)return true;
	  }catch(e){
	  	console.log('no prev message stored');
	  }
	  
	  //delayed message handling
	 nodes[index].prevMsg = {msg: 'startDrag', ts: ts};
	//console.log("startDrag: " + index + " ts: " + ts)
	 return udp.send(buf, 0, buf.length, outport, "localhost");
	 

	},
	
	sendDragOff: function(row, seat, ctrlIndex, ts) {
  
	  var buf;
	  var index = row + '_' + seat;
	  
	  buf = osc.toBuffer({
		address: "/node/endDrag",
		args: [row, seat, ctrlIndex]
	  });
	  
	  //ignore repeat messages
	  try{
	  	if(nodes[index].prevMsg.ts >= ts)return true;
	  }catch(e){
	  	console.log('no prev message stored');
	  }
	  
	  //delayed message handling
	 nodes[index].prevMsg = {msg: 'endDrag', ts: ts};
	console.log("endDrag: " + index + " ts: " + ts)
	 return udp.send(buf, 0, buf.length, outport, "localhost");
	 

	},
	
	sendNodeOn: function(row, seat, ctrlIndex ,ts, x, y, type) {
  
	  var buf;
	  var index = row + '_' + seat;
	  
	  buf = osc.toBuffer({
		address: "/node/on",
		args: [row, seat, ctrlIndex, x, y, type]
	  });
	  
	  //ignore repeat messages
	  try{
	  	if(nodes[index].prevMsg.ts >= ts)return true;
	  }catch(e){
	  	console.log('no prev message stored');
	  }
	  
	  //delayed message handling
	 nodes[index].prevMsg = {msg: 'on', ts: ts};
	
	if(!nodes[index].isOn){
		console.log("nodeOn: " + index + " ts: " + ts)
	 	nodes[index].isOn = true;
	 	return udp.send(buf, 0, buf.length, outport, "localhost");
	 }
	 

	},
	
	sendNodeOff: function(row, seat, ctrlIndex, ts, x, y) {
  
	  var buf;
	  var index = row + '_' + seat;
	  
	  buf = osc.toBuffer({
				address: "/node/off",
				args: [row, seat, ctrlIndex]
	  });
	  
  	  //ignore repeat & delayed messages
  	  try{
	  	if(nodes[index].prevMsg.ts >= ts)return true; //ignore all old messages
	  }catch(e){
	  	console.log('no prev msg stored');
	  }
	  
	  nodes[index].prevMsg = {msg: 'off', ts: ts};
	  
	  if(nodes[index].isOn){
		  console.log("nodeOff: " + index + " ts: " + ts);
		  nodes[index].isOn = false;
		  return udp.send(buf, 0, buf.length, outport, "localhost");
	  }
	  
	  
	},
	
	updateNode: function(row, seat, ctrlIndex, x, y, type) {
  
	  var buf;

	  buf = osc.toBuffer({
				address: "/node/position",
				args: [row, seat, ctrlIndex,x,y, type]
	  });
  
	  return udp.send(buf, 0, buf.length, outport, "localhost");
	}
	
});



parseIncomingOsc = function(msg){

	
	//parse the address
	for(var i = 0; i < msg.elements.length; i++){
	
		var add_str = msg.elements[i].address.substr(1);
		var add_array = add_str.split('/');
		var arg_array = msg.elements[i].args;
	
		if(add_array[0] == 'newControl'){
			
			var un = arg_array[0].value;
			var nc_index = arg_array[1].value;
			var d = new Date();
			var user = UserData.findOne({uname: un});
			
			//always turn off nodes for a new control		
			nodes[user.uname].isOn = false;
			
			UserData.update({uname: un}, {$set: {displayType: nc_index, displayText: arg_array[2].value, ctrlIndex: arg_array[3].value}});
			
			
		}else if(add_array[0] == 'newText'){
			
			
			var un = arg_array[0].value;
			var text = arg_array[1].value;
			
			UserData.update({uname: un}, {$set: {displayText: text}});
			
			
		}
			
	}
	
	
	
	

}




