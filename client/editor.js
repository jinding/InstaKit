Meteor.startup(function () {
  Session.set("emailNotSaved",false);
});

Meteor.subscribe('files');
Meteor.subscribe('settings');

UI.registerHelper("wrapperStyle", function(str) {
  return Session.equals('templateChooser', str) ? "true" : "";
});

UI.registerHelper("display_setting", function(selection) {
  return Session.equals("display",selection);
});

UI.registerHelper("getValue", function(value) {
  return Session.get(value);
});

UI.registerHelper("highlight", function(value) {
  return Session.get(value) ? null : 'unchanged';
});

UI.registerHelper("sigFirstName", function() {
  return Session.get("signature").split(' ')[0];
});

UI.registerHelper("unformattedHtml", function(wrapper) {
  // return the HTML code of the template being referenced
  var div = document.createElement('div');
  switch (wrapper) {
    case "blank": UI.insert(UI.render(Template.blankEmailWrapperBody), div); break;
    case "call": UI.insert(UI.render(Template.callEmailWrapperBody), div); break;
    case "event": UI.insert(UI.render(Template.eventEmailWrapperBody), div); break;
    case "mobilize": UI.insert(UI.render(Template.mobilizeEmailWrapperBody), div); break;
    case "petition": UI.insert(UI.render(Template.petitionEmailWrapperBody), div); break;
    case "publicComment": UI.insert(UI.render(Template.publicCommentEmailWrapperBody), div); break;
    case "takeAction": UI.insert(UI.render(Template.takeActionEmailWrapperBody), div); break;
    case "superpacFundraiser": UI.insert(UI.render(Template.superpacFundraiserEmailWrapperBody), div); break;
    default: return "unformatted html not yet set";
  }
  return div.innerHTML;
});

UI.registerHelper("htmlFromMarkdown", function(field) {
  var converter = new Showdown.converter();
  return converter.makeHtml(Session.get(field));
});

UI.registerHelper("removeBackslash", function(field) {
  var str = Session.get(field);
  return str.replace(/\\/g,'');
});

UI.registerHelper("prettifyDate", function(d) {
  if (d) {
    var a_p = "";
    var curr_hour = d.getHours();
    var curr_min = d.getMinutes();
    var pad = function (x) {
      return (x < 10 ? '0' : '') + x;
    };

    if (curr_hour < 12) { a_p = "AM";}
      else { a_p = "PM"; }
    if (curr_hour == 0) { curr_hour = 12; }
    if (curr_hour > 12) { curr_hour = curr_hour - 12; }

    var str = [d.getMonth()+1,d.getDate(),d.getFullYear()-2000].join('/') +
      " " + curr_hour + ":" + pad(curr_min) + " " + a_p;
    return str;
  } else { return ''; }
});

// settings functions
setSessionVarsForSettings = function(obj) {
  Session.set("id", obj._id);
  Session.set("orgName", obj.orgName);
  Session.set("akAuth", obj.akAuth);
  Session.set("tagName", obj.tagName);
  Session.set("resourceId", obj.resourceId);
  Session.set("spKey", obj.spKey);
  Session.set("spUrl", obj.spUrl);
  Session.set("bitlyToken", obj.bitlyToken);
};

// email functions
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
  else if (Session.equals("templateChooser","superpacFundraiser"))
    Session.set("signature", "Becky Bond, President");
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
  Session.set('signature', Meteor.user().profile.name + ', Campaign Manager');
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

removeCurlyQuotes = function (str) {
  var goodQuotes = str
  .replace(/[\u2018\u2019]/g, "'")
  .replace(/[\u201C\u201D]/g, '"');
  return goodQuotes;
};

urlEncodeQuotes = function (str) {
  return str.replace(/['""]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
};

// page functions
setSessionVarsForPage = function (obj) {
  Session.set("id", obj._id);
  Session.set("type", obj.type);
  Session.set("pageType", obj.pageType);
  Session.set('templateChooser', obj.pageType);
  Session.set("notes", obj.notes);
  Session.set("pageTitle", obj.pageTitle);
  Session.set("pageName", obj.pageName);
  Session.set("pageStatementLeadIn", obj.pageStatementLeadIn);
  Session.set("pageStatementText", obj.pageStatementText);
  Session.set("pageAboutText", obj.pageAboutText);
  Session.set("pageGraphicEmail", obj.pageGraphicEmail);
  Session.set("pageGraphicFacebook", obj.pageGraphicFacebook);
  Session.set("pageGraphicHomePage", obj.pageGraphicHomePage);
  Session.set("pageTAFSL", obj.pageTAFSL);
  Session.set("pageTAFCopy", obj.pageTAFCopy);
  Session.set("pageFacebookTitle", obj.pageFacebookTitle);
  Session.set("pageFacebookCopy", obj.pageFacebookCopy);
  Session.set("pageTwitterCopy", obj.pageTwitterCopy);
  Session.set("pageConfEmailSL", obj.pageConfEmailSL);
  Session.set("pageConfEmailSender", obj.pageConfEmailSender);
  Session.set("pageConfEmailBody", obj.pageConfEmailBody);
  Session.set("pageTags", obj.pageTags);
  Session.set("creator", obj.creator);
  Session.set("when", obj.when);
  Session.set('AKpageURL', obj.AKpageURL);
  Session.set('AKpageEditURL', obj.AKpageEditURL);
  Session.set('AKpageBitly', obj.AKpageBitly);
  Session.set('pageSharePageLink', obj.pageSharePageLink);
  Session.set('AKpageID',obj.AKpageID);
  Session.set('AKpageResourceURI', obj.AKpageResourceURI);

  // event variables
  Session.set("eventDefaultTitle", obj.eventDefaultTitle);
  Session.set("eventDefaultSize", obj.eventDefaultSize);
  Session.set("eventMaxSize", obj.eventMaxSize);
  Session.set("eventStartDate", obj.eventStartDate);
  Session.set("eventStartTime", obj.eventStartTime);
  Session.set("eventUmbrellaCampaignURL", obj.eventUmbrellaCampaignURL);
  Session.set("eventUmbrellaHostURL", obj.eventUmbrellaHostURL);
  Session.set("eventUmbrellaSignupPageURL", obj.eventUmbrellaSignupPageURL);
};

setSessionVarsForNewPage = function () {
  // template type is set in the link event handler so not necessary here
  // clear the other email session data
  Session.set("type", "page");
  Session.set("notes", "");
  Session.set("pageTitle", "");
  Session.set("pageName", "");
  Session.set("pageStatementLeadIn", "");
  Session.set("pageStatementText", "");
  Session.set("pageAboutText", "");
  Session.set("pageGraphicEmail", "");
  Session.set("pageGraphicFacebook", "");
  Session.set("pageGraphicHomePage", "");
  Session.set("pageTAFSL", "");
  Session.set("pageTAFCopy", "");
  Session.set("pageFacebookTitle", "");
  Session.set("pageFacebookCopy", "");
  Session.set("pageTwitterCopy", "");
  Session.set("pageConfEmailSL", "");
  Session.set("pageConfEmailSender", "");
  Session.set("pageConfEmailBody", "");
  Session.set("pageTags", "");
  Session.set("creator", "");
  Session.set('AKpageURL', "");
  Session.set('AKpageEditURL', "");
  Session.set('AKpageBitly', "");
  Session.set('pageSharePageLink', "");
  Session.set('AKpageID',"");
  Session.set('AKpageResourceURI', "");
}

setSessionVarsForNewEvent = function () {
  // additional variables to be initialized for new events
  Session.set("eventDefaultTitle", "");
  Session.set("eventDefaultSize", "");
  Session.set("eventMaxSize", "");
  Session.set("eventStartDate", "");
  Session.set("eventStartTime", "");
  Session.set("eventUmbrellaCampaignURL", "");
  Session.set("eventUmbrellaHostURL", "");
  Session.set("eventUmbrellaSignupPageURL", "");
  Session.set('subEventCreatedMsg', "");
};

setSessionVarsForNewSubEvent = function (obj) {
  Session.set("subEventTitle", obj.eventDefaultTitle);
  Session.set("subEventMaxAttendees", obj.eventDefaultSize);
  Session.set("subEventStartsAt", obj.eventStartDate + " " + obj.eventStartTime);
  Session.set("subEventHostEmail", obj.subEventHostEmail || Meteor.user().profile.name.substr(0,1)+Meteor.user().profile.name.split(" ")[1]+"@credoaction.com");

  Session.set("subEventVenue", obj.subEventVenue);
  Session.set("subEventAddress1", obj.subEventAddress1);
  Session.set("subEventAddress2", obj.subEventAddress2);
  Session.set("subEventCity", obj.subEventCity);
  Session.set("subEventState", obj.subEventState);
  Session.set("subEventZip", obj.subEventZip);
  Session.set("subEventDirections", obj.subEventDirections);
  Session.set("subEventPublicDescription", obj.subEventPublicDescription);
  Session.set("subEventNoteToAttendees", obj.subEventNoteToAttendees);

/*
  Session.set("subEventVenue", "");
  Session.set("subEventAddress1", "");
  Session.set("subEventAddress2", "");
  Session.set("subEventCity", "");
  Session.set("subEventState", "");
  Session.set("subEventZip", "");
  Session.set("subEventDirections", "");
  Session.set("subEventPublicDescription", "");
  Session.set("subEventNoteToAttendees", "");
*/
  Session.set("subEventCreatedMsg","");
};

initSessionVarsForPageCompose = function () {
  Session.set("showNavBar",false);
  Session.set("snippets",false);
  Session.set("toolTips",false);
  Session.set("pageNotSaved",false);
  Session.set("saveDialog",false);
};

window.onbeforeunload = function () {
  if (Session.get("emailNotSaved")) {
    return "This email hasn't been saved.";
  } else if (Session.get("pageNotSaved")) {
    return "This page hasn't been saved.";
  } else { return null; }
};

UI.registerHelper("headlineButtonText", function() {
  switch (Session.get("fileSort")) {
    case 'headlineAsc': return "▲";
    case 'headlineDesc': return '▼';
    default: return '—';
  }
});

UI.registerHelper("typeButtonText", function() {
  switch (Session.get("fileSort")) {
    case 'typeAsc': return "▲";
    case 'typeDesc': return '▼';
    default: return '—';
  }
});

UI.registerHelper("createdByButtonText", function() {
  switch (Session.get("fileSort")) {
    case 'createdByAsc': return "▲";
    case 'createdByDesc': return '▼';
    default: return '—';
  }
});

UI.registerHelper("savedByButtonText", function() {
  switch (Session.get("fileSort")) {
    case 'savedByAsc': return "▲";
    case 'savedByDesc': return '▼';
    default: return '—';
  }
});

UI.registerHelper("savedAtButtonText", function() {
  switch (Session.get("fileSort")) {
    case 'savedAtAsc': return "▲";
    case 'savedAtDesc': return '▼';
    default: return '—';
  }
});

UI.registerHelper("belongsToUser", function(name) {
  return Meteor.user() && Meteor.user().profile.name === name;
});

UI.registerHelper("isNotEvent", function(pageType) {
  return pageType !== 'event';
});

UI.registerHelper("isAdmin", function() {
  var admins = ['Jin Ding'];

  return Meteor.user() && admins.indexOf(Meteor.user().profile.name) >= 0;
});
