


Template.gameMain.isSmallTextDisplay = function(){
	var u = UserData.findOne({id: Meteor.user()._id});
	if(u)return (u.displayType == "SMALL_TEXT");
}

Template.gameMain.isBigTextDisplay = function(){
	var u = UserData.findOne({id: Meteor.user()._id});
	if(u)return (u.displayType == "BIG_TEXT");
}

Template.gameMain.isXyOnOff = function(){
	var u = UserData.findOne({id: Meteor.user()._id});
	if(u)return (u.displayType == "XY_ON_OFF");
}

Template.gameMain.isXyCont = function(){
	var u = UserData.findOne({id: Meteor.user()._id});
	if(u)return (u.displayType == "XY_CONT");
}

Template.gameMain.isJoyPad = function(){
	var u = UserData.findOne({id: Meteor.user()._id});
	if(u)return (u.displayType == "JOY");
}

Template.gameMain.isDragOnOff = function(){
	var u = UserData.findOne({id: Meteor.user()._id});
	if(u)return (u.displayType == "DRAG_ON_OFF");
}

Template.gameMain.isDragCont = function(){
	var u = UserData.findOne({id: Meteor.user()._id});
	if(u)return (u.displayType == "DRAG_CONT");
}


Template.gameMain.isTargetPad = function(){
	var u = UserData.findOne({id: Meteor.user()._id});
	if(u)return (u.displayType == "TARGET");
}

Template.gameMain.isButtonDisplay = function(){
	var u = UserData.findOne({id: Meteor.user()._id});
	if(u)return (u.displayType == "BUTTON");
}


Template.bigTextDisplay.displayText = function(){
	var u = UserData.findOne({id: Meteor.user()._id});
	if(u)return (u.displayText);
}

Template.smallTextDisplay.displayText = function(){
	var u = UserData.findOne({id: Meteor.user()._id});
	if(u)return (u.displayText);
}

Template.gameMain.events({
	
	'click button#logout':function(){
		
		Meteor.logout();
	}

});

