Meteor.startup(function () {
  Session.set("emailNotSaved",false);
});

Meteor.subscribe('files');

Handlebars.registerHelper("wrapperStyle", function(str) {
  return Session.equals('templateChooser', str) ? "true" : "";
});

Handlebars.registerHelper("display_setting", function(selection) {
  return Session.equals("display",selection);
});

Handlebars.registerHelper("getValue", function(value) {
  return Session.get(value);
});

Handlebars.registerHelper("highlight", function(value) {
  return Session.get(value) ? null : 'unchanged';
});

Handlebars.registerHelper("sigFirstName", function() {
  return Session.get("signature").split(' ')[0];
});

Handlebars.registerHelper("unformattedHtml", function(wrapper) {
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

Handlebars.registerHelper("htmlFromMarkdown", function(field) {
  var converter = new Showdown.converter();
  return converter.makeHtml(Session.get(field));
});

Handlebars.registerHelper("removeBackslash", function(field) {
  var str = Session.get(field);
  return str.replace(/\\/g,'');
});

Handlebars.registerHelper("prettifyDate", function(d) {
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

// router

// email functions
function setSessionVarsForEmail(obj) {
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
  Session.set("creator", obj.creator);
  Session.set("when", obj.when);
}

function setSessionVarsForNewEmail() {
  // template type is set in the link event handler so not necessary here
  // clear the other email session data
  Session.set("markdown_data", "");
  Session.set("topper", "");
  Session.set("notes", "");
  Session.set("headline", "");
  Session.set("statement_leadin", "");
  Session.set("petition", "");
  Session.set("link", "");
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
  Session.set("creator", "");
}

function setSessionVarsForEmailFromPage(obj) {
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
  Session.set("twitter", 'https://twitter.com/intent/tweet?&text='+encodeURIComponent(twitter));
  Session.set("creator", Meteor.user().profile.name);
}

function initSessionVarsForCompose() {
  Session.set("display", "visual");
  Session.set("showNavBar",false);
  Session.set("snippets",false);
  Session.set("toolTips",false);
  Session.set("emailNotSaved",false);
  Session.set("saveDialog",false);
}

// page functions
function setSessionVarsForPage(obj) {
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
  Session.set("pageConfEmailBody", obj.pageConfEmailBody);
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

}

function setSessionVarsForNewPage() {
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
  Session.set("pageConfEmailBody", "");
  Session.set("creator", "");
  Session.set('AKpageURL', "");
  Session.set('AKpageEditURL', "");
  Session.set('AKpageBitly', "");
  Session.set('pageSharePageLink', "");
  Session.set('AKpageID',"");
  Session.set('AKpageResourceURI', "");
}

function setSessionVarsForNewEvent() {
  // additional variables to be initialized for new events
  Session.set("eventDefaultTitle", "");
  Session.set("eventDefaultSize", "");
  Session.set("eventMaxSize", "");
  Session.set("eventStartDate", "");
  Session.set("eventStartTime", "");
}

function initSessionVarsForPageCompose() {
  Session.set("showNavBar",false);
  Session.set("snippets",false);
  Session.set("toolTips",false);
  Session.set("pageNotSaved",false);
  Session.set("saveDialog",false);
}

Router.map(function () {
  this.route('home', {
    path: '/',
    template: 'filePage',
    action: Session.set('emailNotSaved',false)
  });

  this.route('mailings', {
    path: '/mailings/',
    template: 'filePage',
    action: Session.set('emailNotSaved',false)
  });

  this.route('compose', {
    // compose route with an optional ID parameter
    path: '/mailings/compose/:_id?',
    template: 'composePage',
    onBeforeAction: function () {
      if (this.params._id) {
        // edit an existing email
        Session.set("newEmail", false);
        var email = Files.findOne(this.params._id);
        setSessionVarsForEmail(email);
      } else if (this.params.copy) {
        // create a new email by copying another email
        console.log("copying mailing " + this.params.copy);
        var email = Files.findOne(this.params.copy);
        setSessionVarsForEmail(email); // copy email vars from selected email
        Session.set("newEmail", true); // but this is a new email, not a current email
        // clear creator and ID vars because this is a new email
        Session.set("creator", "");
        Session.set("id", "");
      } else if (this.params.page) {
        // create an email from a saved page
        var page = Files.findOne(this.params.page);
        setSessionVarsForEmailFromPage(page);
        Session.set("newEmail", true);
        Session.set("creator","");
        Session.set("id","");
      } else {
        // create a new email
        Session.set("newEmail", true);
        Session.set("creator","");
        Session.set("id","");
        // default to petition email if no query parameter for template set
        Session.set('templateChooser',this.params.template || 'petition');
        setSessionVarsForNewEmail();
      } 
      initSessionVarsForCompose();
    }
  });

  this.route('pages', {
    path: '/pages/',
    template: 'pages'
  });

  this.route('createPage', {
    path: '/pages/compose/:_id?',
    template: 'createPage',
    onBeforeAction: function () {
      if (this.params._id) {
        Session.set("newPage", false);
        var page = Files.findOne(this.params._id);
        // check for missing page and throw a 404
        setSessionVarsForPage(page);
      } else if (this.params.copy) {
        var page = Files.findOne(this.params.copy);
       // check for missing email and throw a 404
        setSessionVarsForPage(page); // copy page vars from selected page
        Session.set("newPage", true); // but this is a new page, not a current page
        // clear creator and ID vars, as well as created page vars because this is a new page
        Session.set("creator", "");
        Session.set("id", "");
        Session.set('AKpageURL', "");
        Session.set('AKpageEditURL', "");
        Session.set('AKpageBitly', "");
        Session.set('pageSharePageLink', "");
        Session.set('AKpageID',"");
        Session.set('AKpageResourceURI', "");
      } else {
        Session.set("newPage", true);
        Session.set("creator", "");
        Session.set("id", "");
        // default to petition page type if no query parameter for template set
        Session.set('templateChooser', this.params.template || 'petition');
        setSessionVarsForNewPage();
        if (this.params.template == 'event') { setSessionVarsForNewEvent(); }
      } 
      initSessionVarsForPageCompose();
    }
  });

  this.route('restore', {
    path: '/restore/',
    template: 'adminDeletedFilesPage'
  });

  this.route('postAPI', {
    path: '/pages/postAPI/:_id?',
    template: 'postAPIpage',
    onBeforeAction: function() {
      var page = Files.findOne(this.params._id);  
      setSessionVarsForPage(page);
    }
  });

  this.route('createSubEvents', {
    path: '/pages/createSubEvents/:_id?',
    template: 'createSubEvents',
    onBeforeAction: function() {
      var eventUmbrella = Files.findOne(this.params._id);
      console.log('hello');
    }
  })

});

// this hook will run on almost all routes
Router.onBeforeAction(function (pause) {
  if (! Meteor.user()) {
    this.render('loginPage');
    pause();
  }
}, {except: ['login']});


window.onbeforeunload = function closeIt() {
  if (Session.get("emailNotSaved")) {
    return "This email hasn't been saved.";
  } else if (Session.get("pageNotSaved")) {
    return "This page hasn't been saved.";
  } else { return null; }
};

Handlebars.registerHelper("headlineButtonText", function() {
  switch (Session.get("fileSort")) {
    case 'headlineAsc': return "▲";
    case 'headlineDesc': return '▼';
    default: return '—';
  }
});

Handlebars.registerHelper("typeButtonText", function() {
  switch (Session.get("fileSort")) {
    case 'typeAsc': return "▲";
    case 'typeDesc': return '▼';
    default: return '—';
  }
});

Handlebars.registerHelper("createdByButtonText", function() {
  switch (Session.get("fileSort")) {
    case 'createdByAsc': return "▲";
    case 'createdByDesc': return '▼';
    default: return '—';
  }
});

Handlebars.registerHelper("savedByButtonText", function() {
  switch (Session.get("fileSort")) {
    case 'savedByAsc': return "▲";
    case 'savedByDesc': return '▼';
    default: return '—';
  }
});

Handlebars.registerHelper("savedAtButtonText", function() {
  switch (Session.get("fileSort")) {
    case 'savedAtAsc': return "▲";
    case 'savedAtDesc': return '▼';
    default: return '—';
  }
});

Handlebars.registerHelper("belongsToUser", function(name) {
  return Meteor.user() && Meteor.user().profile.name === name;
});

Handlebars.registerHelper("isAdmin", function() {
  var admins = ['Jin Ding'];

  return Meteor.user() && admins.indexOf(Meteor.user().profile.name) >= 0;
});

