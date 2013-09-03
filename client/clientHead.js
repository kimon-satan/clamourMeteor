
devId = null;

Meteor.startup(function(){

	Session.set('clamourReady', false);
	
	


});

Meteor.subscribe('clamourData', function(){

	Session.set('clamourReady', true);

});

Meteor.subscribe('players', function(){

	if(Meteor.user()){
		Meteor.setInterval(timeStamp, 1 * 1000);
	}

});

Handlebars.registerHelper('isClamourReady', function(){return Session.get('clamourReady')});

timeStamp = function(){

	var nd = new Date();
	console.log('timeStamp user');
	Meteor.users.update(Meteor.user()._id, {$set: {'profile.prevTS': nd.getTime()}});

}