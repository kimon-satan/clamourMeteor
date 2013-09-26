

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
		
		Session.set('isWaiting', true);
		Session.set('error', false);

		var tc = $('#loginTC').val()
		, sr = $('#loginSR').val()
		, sn = $('#loginSN').val();
		
		var username = sr + "_" + String(sn);
		
		
		Meteor.call('checkPlayerFree', username, devId, function(err, res){
			
			if(res){

				Session.set('isWaiting', false);

				
				Meteor.loginWithPassword(username, "1234", function(err_1){
					
					
						if(err_1){
							console.log(err_1.reason);
							Session.set('error', err_1.reason);
						}else{
							Meteor.call('setupSession');
						}
				
					
				});
			
			}else{
				console.log(err.reason);
				Session.set('error', err.reason);
				Session.set('isWaiting', false);
			}
		})
		
		
	
	}

});

Template.login_hello.getError = function(){return Session.get('error');}

	

	












