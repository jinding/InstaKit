Template.templatePageTitle.events({
  'blur input[type=text]': function() {
    Session.set("pageTitle", $('#pageTitle').val());
  }
});

Template.templatePageName.events({
  'blur input[type=text]': function() {
    Session.set("pageName", $('#pageName').val());
  }
});

Template.templatePageStatement.events({
  'blur input': function() {
    Session.set("pageStatementLeadIn", $('#pageStatementLeadIn').val());
 },
  'blur textarea': function() {
    Session.set("pageStatementText", $('#pageStatementText').val());
  }
});

Template.templatePageAboutText.events({
  'mouseout textarea': function() {
    Session.set("pageAboutText", $('#pageAboutText').val());
  }
});

Template.templatePageFacebook.events({
  'blur input[type=text]': function() {
    Session.set("pageFacebookTitle", $('#pageFacebookTitle').val());
  },
  'keyup textarea': function() {
    Session.set("pageFacebookCopy", $('#pageFacebookCopy').val());
    Session.set("pageFacebookLength", 260 - $('#pageFacebookCopy').val().length)
  }
});

Template.templatePageTwitterCopy.events({
  'keyup textarea': function() {
    Session.set("pageTwitterCopy", $('#pageTwitterCopy').val());
    // assume 23 chars for links, but if {LINK} exists then only need 16 more spaces
    var linkLength = $('#pageTwitterCopy').val().search(/{ *LINK *}/i) < 0 ? 23 : 16;
    Session.set("pageTwitterLength", 140 - linkLength - $('#pageTwitterCopy').val().length)
  }
});

Template.templatePageTAF.events({
  'blur input[type=text]': function() {
    Session.set("pageTAFSL", $('#pageTAFSL').val());
  },
  'blur textarea': function() {
    Session.set("pageTAFCopy", $('#pageTAFCopy').val());
  }
});

Template.templatePageConfEmail.events({
  'blur input[type=text]': function() {
    Session.set("pageConfEmailSL", $('#pageConfEmailSL').val());
    Session.set("pageConfEmailBody", $('#pageConfEmailBody').val());
  },
  'blur textarea': function() {
    Session.set("pageConfEmailBody", $('#pageConfEmailBody').val());
  },
  'blur select': function() {
    Session.set('pageConfEmailSender', $('#pageConfEmailSender').val());
  }
});

Template.templatePageConfEmail.helpers({
  confEmailSender: function(name) {
    if (Session.get('pageConfEmailSender') && Session.get('pageConfEmailSender') === name)
      return '<option value="' + name + '"" selected >' + name + '</option>';
    else return '<option value="' + name + '">' + name + '</option>';
  }
});

Template.templatePageGraphics.events({
  'blur #pageGraphicEmail': function() {
    Session.set("pageGraphicEmail", $('#pageGraphicEmail').val());
  },
  'blur #pageGraphicFacebook': function() {
    Session.set("pageGraphicFacebook", $('#pageGraphicFacebook').val());
  },
  'blur #pageGraphicHomePage': function() {
    Session.set("pageGraphicHomePage", $('#pageGraphicHomePage').val());
  }
});

Template.templatePageTags.events({
  'blur input[type=checkbox]': function() {
    var checked =  $(":checkbox:checked").map(function() {
        return this.value;
    }).get();
    Session.set("pageTags", checked);
  }
});

Template.templatePageTags.helpers({
  tagCheckbox: function(name) {
    if (Session.get('pageTags') && Session.get('pageTags').indexOf(name) >= 0)
        return '<label><input type="checkbox" name="pageTags" value="' + name + '" checked >'+ name +'</label>';
    else return '<label><input type="checkbox" name="pageTags" value="' + name + '" >'+ name +'</label>';
  }
});