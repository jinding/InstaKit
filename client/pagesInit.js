// page initialization functions

// set the session vars for an existing page in the database
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

  Session.set("subEventCreatedMsg","");
};

initSessionVarsForPageCompose = function () {
  Session.set("showNavBar",false);
  Session.set("snippets",false);
  Session.set("toolTips",false);
  Session.set("pageNotSaved",false);
  Session.set("saveDialog",false);
};