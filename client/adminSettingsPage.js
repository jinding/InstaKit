Template.templateSettingsOrgName.events({
  'keyup input[type=text]': function() {
    Session.set("orgName", $('#orgName').val());
  }
});

Template.templateSettingsAkAuth.events({
  'keyup input[type=text]': function() {
    Session.set("akAuth", $('#akAuth').val());
  }
});

Template.templateSettingsAkUrl.events({
  'keyup input[type=text]': function() {
    Session.set("tagName", $('#tagName').val());
  }
});

Template.templateSettingsAkOrgTagResourceId.events({
  'keyup input[type=text]': function() {
    Session.set("resourceId", $('#resourceId').val());
  }
});

Template.templateSettingsSpKey.events({
  'keyup input[type=text]': function() {
    Session.set("spKey", $('#spKey').val());
  }
});

Template.templateSettingsSpUrl.events({
  'keyup input[type=text]': function() {
    Session.set("spUrl", $('#spUrl').val());
  }
});

Template.templateSettingsBitlyToken.events({
  'keyup input[type=text]': function() {
    Session.set("bitlyToken", $('#bitlyToken').val());
  }
});

Template.settingsInputs.events({
  'click #buttonSaveSettings': function() {
      Meteor.call('saveSettings', makeSettingsFromSession(), function (err, res) {
        if (err) {
          Session.set('saveError', err.error);
        } else {
          console.log('settings saved');
        }
      });
  }

});

setSessionVars = function() {
	Session.set("orgName", $('#orgName').val());
	Session.set("akAuth", $('#akAuth').val());
	Session.set("tagName", $('#tagName').val());
	Session.set("resourceId", $('#resourceId').val());
	Session.set("spKey", $('#spKey').val());
	Session.set("spUrl", $('#spUrl').val());
	Session.set("bitlyToken", $('#bitlyToken').val());
};

makeSettingsFromSession = function() {
  setSessionVars();

  return {
    id: Session.get('sessionId'),
  	orgName: Session.get('orgName'),
  	akAuth: Session.get('akAuth'),
  	tagName: Session.get('tagName'),
  	resourceId: Session.get('resourceId'),
  	spKey: Session.get('spKey'),
  	spUrl: Session.get('spUrl'),
  	bitlyToken: Session.get('bitlyToken')
  }
};

