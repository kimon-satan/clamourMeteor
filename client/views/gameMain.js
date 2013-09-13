Template.gameMain.isSmallTextDisplay = function(){
	var u = UserData.findOne({id: Meteor.user()._id});
	if(u)return (u.displayType == "SMALL_TEXT");
}

Template.gameMain.isBigTextDisplay = function(){
	var u = UserData.findOne({id: Meteor.user()._id});
	if(u)return (u.displayType == "BIG_TEXT");
}

Template.gameMain.isXyDisplay = function(){
	var u = UserData.findOne({id: Meteor.user()._id});
	if(u)return (u.displayType == "XY");
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