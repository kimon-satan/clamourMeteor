
devId = null;
timeStampHandle = null;

Meteor.startup(function(){
	
	Session.set('clamourReady', false);
	Session.set('isAdmin', false);
	
});

//////
////// Subscriptions
//////

Meteor.subscribe('clamourData', function(){Session.set('clamourReady', true);});
Meteor.subscribe('userData');

Handlebars.registerHelper('isClamourReady', function(){return Session.get('clamourReady')});
Handlebars.registerHelper('isAdmin', function(){return Session.get('isAdmin')});
Handlebars.registerHelper('isWaiting', function(){return Session.get('isWaiting')});

Template.userHead.created = function(){
	
	var startSession = setInterval(function(){
		if(Meteor.user()){
			clearInterval(startSession);
			Meteor.call('setupSession');
		}
	}, 500);
	
	
}

timeStamp = function(){

	if(Meteor.user()){
		Meteor.call('timeStamp', Meteor.user(), devId);
	}else{
		Meteor.clearInterval(timeStampHandle);
	}

}

setCookie = function(c_name, value, exSecs){

	var exdate = new Date();
	exdate.setDate(exdate.getTime() + exSecs * 1000);
	var c_value=escape(value) + ((exSecs==null) ? "" : "; expires=" + exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
	
}


getCookie = function(c_name){

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

checkCookie = function(){

	var t_id=getCookie("devId");

  	if (t_id == null || t_id ==""){
  
  		t_id = Math.random().toString(36).slice(2);
		setCookie("devId", t_id, 3600); //cookie lasts for 1 hr
	}
	
	return t_id;
	
}




Meteor.methods({

	setupSession: function(){
	
		this.isSimulation = false;
		// if logged in as admin automatically go to admin	
		

		if(Meteor.user().profile.admin){
			
			Meteor.subscribe('allPlayers', Meteor.user());
			Session.set('isAdmin', Meteor.user().profile.admin); 
			Meteor.subscribe('SUsers', Meteor.user());
		}else{
			devId = checkCookie();
			Session.set('isAdmin', false);
			Meteor.clearInterval(timeStampHandle);
			timeStamp();
			timeStampHandle = Meteor.setInterval(timeStamp, tsInterval);
		}
	
	
	}

});



