Template.login_hello.created = function(){

	devId = checkCookie();

};

Template.login_hello.seatRows = function(){

	var items = new Array();
	for(var i = 0; i < numRows; i++) items[i] = String.fromCharCode(i + 65);
	return items;
	
}

Template.login_hello.seatNumbers = function(){
		
	var items = new Array();
	for(var i = 0; i < numSeats; i++) items[i] = i + 1;
	return items;
	

}


Template.login_hello.events({

	'click button':function(){
				
		var tc = $('#loginTC').val()
		, sr = $('#loginSR').val()
		, sn = $('#loginSN').val();
		
		var user = Meteor.users.findOne({username: sr + String(sn)});
	
		if(!user.profile.isActive || (user.profile.isActive && devId == user.profile.devId)){
		
			//login
			Meteor.loginWithPassword(user.username, "1234", function(err){
				
				if(!err){
					var d = new Date();
					Meteor.users.update(Meteor.user()._id, {$set: {'profile.devId' : devId, 
															'profile.isActive': true, 
															'profile.prevTS': d.getTime()
															}
													}
											);
											
											
					Meteor.setInterval(timeStamp, 1 * 1000);
											
					
				}else{
					console.log(err.reason);
				}
														
				
			});
			
		}else{
			
			//error message
			//"Another device is currently logged in for this seat number. Are you sure you have entered the correct details ?"
		
		}
	
	}

});

	
function setCookie(c_name, value, exSecs){

	var exdate = new Date();
	exdate.setDate(exdate.getTime() + exSecs * 1000);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires=" + exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
	
}


function getCookie(c_name){

	var c_value = document.cookie;
	var c_start = c_value.indexOf(" " + c_name + "=");
	
	if (c_start == -1){
  		c_start = c_value.indexOf(c_name + "=");
  	}

	if (c_start == -1){

  		c_value = null;
  		
  	}else{
  	
  		c_start = c_value.indexOf("=", c_start) + 1;
  		var c_end = c_value.indexOf(";", c_start);
		if (c_end == -1){c_end = c_value.length;}
		
		c_value = unescape(c_value.substring(c_start,c_end));
	}
		
	return c_value;
}

function checkCookie(){

	var t_id=getCookie("devId");
  	
  	if (t_id!=null && t_id!=""){
	
	  console.log("Welcome again " + t_id);
  
  	}else{
  
  		t_id = Math.random().toString(36).slice(2);
		setCookie("devId", t_id, 3600); //cookie lasts for 1 hr
	}
	
	return t_id;
	
}
	












