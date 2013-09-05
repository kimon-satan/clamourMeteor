Template.gameMain.isTextDisplay = function(){
	var u = UserData.findOne({id: Meteor.user()._id});
	if(u)return (u.displayType == 0);
}

Template.gameMain.isXyDisplay = function(){
	var u = UserData.findOne({id: Meteor.user()._id});
	if(u)return (u.displayType == 1);
}

Template.gameMain.isButtonDisplay = function(){
	var u = UserData.findOne({id: Meteor.user()._id});
	if(u)return (u.displayType == 2);
}


Template.textDisplay.displayText = function(){
	var u = UserData.findOne({id: Meteor.user()._id});
	if(u)return (u.displayText);
}