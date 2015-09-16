Meteor.startup(function () {
  Session.set("emailNotSaved",false);
});

// subscribe to the files and settings collections (ie database)
Meteor.subscribe('files');
Meteor.subscribe('settings');

// curly quotes break some links so convert them to straight quotes
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

// add a check to see if the user wants to save the page before leaving
window.onbeforeunload = function () {
  if (Session.get("emailNotSaved")) {
    return "This email hasn't been saved.";
  } else if (Session.get("pageNotSaved")) {
    return "This page hasn't been saved.";
  } else { return null; }
};

// GLOBAL HELPERS

/*****************************************************
  Set the name(s) of people who have access to
  - Settings: set the AK and SP auth information
  - Admin Deleted Pages: actually delete files from the database
******************************************************/
UI.registerHelper("isAdmin", function() {
  var admins = ['Jin Ding'];
  return Meteor.user() && admins.indexOf(Meteor.user().profile.name) >= 0;
});

// Return the type of mailing
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

// return the HTML code of the template being referenced
UI.registerHelper("unformattedHtml", function(wrapper) {
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

// Markdown converter into HTML
UI.registerHelper("htmlFromMarkdown", function(field) {
  var converter = new Showdown.converter();
  return converter.makeHtml(Session.get(field));
});

// Strip out backslash from Markdown for certain fields
UI.registerHelper("removeBackslash", function(field) {
  var str = Session.get(field);
  return str.replace(/\\/g,'');
});

// used in the file list pages for "last saved" dates
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
