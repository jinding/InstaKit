Meteor.publish('settings', function () {
	return Settings.findOne({});
});