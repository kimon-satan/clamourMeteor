
Template.admin.events({
	
	'click button#allReset':function(){
		Meteor.call('resetDataBases', Meteor.user());
	},
	
	'click button#clientOut':function(){
		Meteor.call('toggleClientOut', Meteor.user());
	},
	
	'click button#controlReset':function(){
		Meteor.call('controlReset', Meteor.user());
	}

});

Template.admin.isAdminPriv = function(){return SUsers.findOne({}, Meteor.user());}
Template.admin.isClientOut = function(){return clamourData.findOne({item: 'clientOut'}).value;}

Template.admin_playerTable.players = function(){return Meteor.users.find({'profile.admin': false},
{sort: {'profile.isActive': -1, 'profile.seat': 1, 'profile.row': 1}})};

Template.admin_player.userData = function(){return UserData.findOne({id: this._id})}


Template.admin_login.events({

	'click button.login':function(){
	
		var un = $('#admin_un').val();
		var pw = $('#admin_pw').val();
		
		Session.set('isWaiting', true);
		
		Meteor.loginWithPassword(un,pw, function(){
			
			Session.set('isWaiting',false);
		
		});
		
	}

});

Template.admin_player.events({

	'click button':function(){
	
		Meteor.call('resetUser', this.username, Meteor.user());
	
	}
	
});