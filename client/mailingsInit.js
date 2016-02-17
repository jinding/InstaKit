
// email initialization functions
setSessionVarsForEmail = function (obj) {
  Session.set("id", obj._id);
  console.log("in setSessionVarsForEmail" + obj._id);
  Session.set("markdown_data", obj.markdown_data);
  Session.set("templateChooser", obj.type);
  Session.set("topper", obj.topper);
  Session.set("notes", obj.notes);
  Session.set("headline", obj.headline);
  Session.set("statement_leadin", obj.statement_leadin);
  Session.set("petition", obj.petition);
  Session.set("link", obj.link);
  Session.set("graphic", obj.graphic);
  Session.set("graphic_alt_text", obj.graphic_alt_text);
  Session.set("signature", obj.signature);
  Session.set("footnotes", obj.footnotes);
  Session.set("facebook", obj.facebook);
  Session.set("twitter", obj.twitter);
  Session.set("refcode", obj.refcode);
  Session.set("creator", obj.creator);
  Session.set("when", obj.when);
};

setSessionVarsForNewEmail = function () {
  // template type is set in the link event handler so not necessary here
  // clear the other email session data
  Session.set("markdown_data", "");
  Session.set("topper", "");
  Session.set("notes", "");
  Session.set("headline", "");
  Session.set("statement_leadin", "");
  Session.set("petition", "");
  if (Session.equals("templateChooser", "superpacFundraiser"))
    Session.set("link","https://secure.actblue.com/contribute/page/savethesenate");
  else Session.set("link", "");
  Session.set("graphic", "");
  Session.set("graphic_alt_text", "");
  if (Session.equals("templateChooser","mobilize"))
    Session.set("signature", "");
  else if (Meteor.user().profile.name == "Mark Ristaino")
    Session.set('signature', "Mark Ristaino, Emperor");
  else if (Meteor.user().profile.name == 'Elijah Zarlin')
    Session.set("signature", "Elijah Zarlin, Director of Climate Campaigns");
  else if (Meteor.user().profile.name == 'Heidi Hess')
    Session.set("signature", "Heidi Hess, Senior Campaign Manager");
  else if (Meteor.user().profile.name == 'Murshed Zaheed')
    Session.set("signature", "Murshed Zaheed, Deputy Political Director");
  else Session.set('signature', Meteor.user().profile.name + ', Campaign Manager');
  Session.set("footnotes", "");
  Session.set("facebook", "");
  Session.set("twitter", "");
  Session.set("refcode", "");
  Session.set("creator", "");
};

setSessionVarsForEmailFromPage = function (obj) {
  Session.set("markdown_data", obj.pageAboutText);
  if (obj.pageType === 'letter')
    Session.set('templateChooser', 'takeaction')
  else Session.set("templateChooser", obj.pageType);
  Session.set("notes", obj.notes);
  Session.set("headline", obj.pageTitle);
  Session.set("statement_leadin", obj.pageStatementLeadIn);
  Session.set("petition", obj.pageStatementText);
  Session.set("link", obj.AKpageURL);
  Session.set("graphic", obj.pageGraphicEmail);
  Session.set("graphic_alt_text", "");
  Session.set("footnotes", "");
  if (Meteor.user().profile.name == "Mark Ristaino")
    Session.set('signature', "Mark Ristaino, Emperor");
  else if (Meteor.user().profile.name == 'Elijah Zarlin')
    Session.set("signature", "Elijah Zarlin, Director of Climate Campaigns");
  else if (Meteor.user().profile.name == 'Heidi Hess')
    Session.set("signature", "Heidi Hess, Senior Campaign Manager");
  else if (Meteor.user().profile.name == 'Murshed Zaheed')
    Session.set("signature", "Murshed Zaheed, Deputy Political Director");
  else Session.set('signature', Meteor.user().profile.name + ', Campaign Manager');
  Session.set("facebook", "");
  var twitter = obj.pageTwitterCopy.replace(/{ *LINK *}/i, obj.AKpageBitly);
  Session.set("twitter", 'https://twitter.com/intent/tweet?&text='+urlEncodeQuotes(encodeURIComponent(removeCurlyQuotes(twitter))));
  Session.set("creator", Meteor.user().profile.name);
};

initSessionVarsForEmailCompose = function () {
  Session.set("display", "visual");
  Session.set("showNavBar",false);
  Session.set("snippets",false);
  Session.set("toolTips",false);
  Session.set("emailNotSaved",false);
  Session.set("saveDialog",false);
};


