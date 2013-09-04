Template.gameMain.isTextDisplay = function(){
	var u = userData.findOne({id: Meteor.user()._id});
	if(u)return (u.displayType == 0);
}

Template.gameMain.isXyDisplay = function(){
	var u = userData.findOne({id: Meteor.user()._id});
	if(u)return (u.displayType == 1);
}