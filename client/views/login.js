

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
		
		var username = sr + "_" + String(sn);
			
		Session.set('isWaiting', true);
		
		Meteor.call('checkPlayerFree', username, devId, function(err, res){
			
			if(res){
				
				Meteor.loginWithPassword(username, "1234", function(err_1){
					
					Session.set('isWaiting', false);
					if(err_1){
						console.log(err_1.reason);
					}else{
						Meteor.call('setupSession');
					}
				
					
				});
			
			}else{
				console.log(err.reason);
				Session.set('isWaiting', false);
			}
		})
		
		
	
	}

});

	

	












