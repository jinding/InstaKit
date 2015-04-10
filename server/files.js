Meteor.publish('files', function () {
	return Files.find({ 'when': {$gte: new Date(new Date().setDate(new Date().getDate()-90))}});
});