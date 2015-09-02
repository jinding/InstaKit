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
