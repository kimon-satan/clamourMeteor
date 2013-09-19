////////// Shared code (client and server) //////////

//app globals
tsInterval =  1000 * 10;
numSeats = 10;
numRows = 10;

clamourData = new Meteor.Collection('clamourData');
SUsers = new Meteor.Collection('SUsers');
UserData = new Meteor.Collection('userData');

