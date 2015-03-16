// ======================== Event Umbrella functions ======================== //

Template.templateEventDefaultTitle.events({
  'blur input[type=text]': function() {
    Session.set("eventDefaultTitle", $('#eventDefaultTitle').val());
  }
});

Template.templateEventDefaultSize.events({
  'blur input[type=text]': function() {
    Session.set("eventDefaultSize", $('#eventDefaultSize').val());
  }
});

Template.templateEventStartDate.events({
  'blur input[type=text]': function() {
    Session.set("eventStartDate", $('#eventStartDate').val());
  }
});

Template.templateEventStartTime.events({
  'blur input[type=text]': function() {
    Session.set("eventStartTime", $('#eventStartTime').val());
  }
});

Template.templateEventConfEmail.events({
  'blur input[type=text]': function() {
    Session.set("pageConfEmailSL", $('#pageConfEmailSL').val());
    Session.set("pageConfEmailBody", $('#pageConfEmailBody').val());
},
  'blur textarea': function() {
    Session.set("pageConfEmailBody", $('#pageConfEmailBody').val());
  }
});


setEventSessionVars = function() {
  Session.set("pageTitle", $('#pageTitle').val());
  Session.set("notes", $('#pageNotes').val());
  Session.set("pageName", $('#pageName').val());
  Session.set("eventDefaultTitle", $('#eventDefaultTitle').val());
  Session.set("eventDefaultSize", $('#eventDefaultSize').val());
  Session.set("eventStartDate", $('#eventStartDate').val());
  Session.set("eventStartTime", $('#eventStartTime').val());
  Session.set("pageConfEmailSL", $('#pageConfEmailSL').val());
  Session.set("pageConfEmailBody", $('#pageConfEmailBody').val());
  Session.set("pageImportConfEmailBody", Session.get("pageConfEmailBody"));
}

makeEventUmbrellaFromSession = function() {
  setEventSessionVars();
  return {
    id: Session.get("id"),
    type: 'page',
    pageType: Session.get('templateChooser'),
    notes: Session.get("notes"),
    pageTitle: Session.get("pageTitle"),
    pageName: Session.get("pageName"),
    eventDefaultTitle: Session.get("eventDefaultTitle"),
    eventDefaultSize: Session.get("eventDefaultSize"),
    eventStartDate: Session.get("eventStartDate"),
    eventStartTime: Session.get("eventStartTime"),
    pageConfEmailSL: Session.get("pageConfEmailSL"),
    pageConfEmailBody: Session.get("pageConfEmailBody"),
    pageImportConfEmailBody: Session.get("pageConfEmailBody"),
    creator: Session.get("creator") || Meteor.user().profile.name,
    savedBy: Meteor.user().profile.name,
    eventUmbrellaCampaignURL: Session.get("eventUmbrellaCampaignURL"),
    eventUmbrellaHostURL: Session.get("eventUmbrellaHostURL"),
    eventUmbrellaSignupPageURL: Session.get("eventUmbrellaSignupPageURL")
  }
};

goodEventUmbrellaFields = function(event) {
  return event.pageTitle && event.pageName && event.eventDefaultTitle && event.eventDefaultSize && event.eventStartDate && event.eventStartTime;
}

Template.createEvent.events({
   'click #buttonEventBackToPages': function() {
    Router.go('pages');
  },
  'click #buttonEventSaveEventUmbrella': function() {
    var eventUmbrella = makeEventUmbrellaFromSession();
    Meteor.call('saveFile', eventUmbrella, function (err, res) {
      if (err) {
        Session.set('saveError', err.error);
      } else {
        console.log('event umbrella saved');
        Session.set("pageNotSaved",false);
        Session.set("saveDialog",false);
        Router.go('pages');
      }
    });
  },
  'click #buttonEventCreateSubEvents': function() {
    Router.go('createSubEvents', {_id: Session.get('id')});
  },
  'click .buttonErrorOK': function() {
    Session.set('apiError',"");
    Session.set('apiSuccess',"");
  },
  'click #buttonEventCreateUmbrella': function() {
    Session.set('showLoading', true);
    var eventUmbrella = makeEventUmbrellaFromSession();
    Meteor.call('saveFile', eventUmbrella, function (err, res) {
      if (err) {
        Session.set('saveError', err.error);
        Session.set('showLoading', false);
      } else {
        console.log('upsert id ' + res.insertedId);
        if (!Session.get('id')) { 
          Session.set('id', res.insertedId); 
          eventUmbrella = makeEventUmbrellaFromSession();
          console.log('event page id ' + eventUmbrella.id);
        }
        Session.set("pageNotSaved",false);
        Session.set("saveDialog",false);
        if (goodEventUmbrellaFields(eventUmbrella)) {
          Meteor.call('eventCreateUmbrella', eventUmbrella, function (err2,res2) {
            if (err2) {
                Session.set('apiError', err2.reason);
                Session.set('showLoading', false);
            } else {
                console.log('event umbrella created successfully');
                console.log('eventUmbrellaCampaignURL: ', res2);
                Session.set('eventUmbrellaCampaignURL', res2);
                Meteor.call('eventCreateHostPage', res2, eventUmbrella, function (err3, res3) {
                  if (err3) {
                      Session.set('apiError', err3.reason);
                      Session.set('showLoading', false);
                  } else {
                    console.log('eventUmbrellaHostURL: ', res3);
                    Session.set('eventUmbrellaHostURL', res3);
                    console.log("Event host page created successfully");
                    eventUmbrella = makeEventUmbrellaFromSession();
                    Meteor.call('eventCreateSignupPage', eventUmbrella, function (err4, res4) {
                      if (err4) {
                          Session.set('apiError', err4.reason);
                          Session.set('showLoading', false);
                      } else {
                        Session.set('eventUmbrellaSignupPageURL', res4);
                        console.log('eventUmbrellaSignupPageURL: ', res4);
                        console.log('Event signup page created successfully');
                        eventUmbrella = makeEventUmbrellaFromSession();
                        Meteor.call('saveFile', eventUmbrella, function (err5, res5) {
                          Session.set('showLoading', false);
                          if (err5) {
                            Session.set('saveError', err5.error);
                          } else {
                            console.log('event umbrella, host page and signup page saved');
                            Router.go('createSubEvents', {_id: Session.get('id')});
                          }
                        });
                      }
                    });                      
                  }
                })
            }
          });
        } else {
          Session.set('apiError', 'required fields not set');
          return;
        }
      }
    });
  }
});



// ============================ subEvent functions ============================ //

Template.createSubEvents.events({
  'click #buttonEventBackToPages': function() {
    Router.go('pages');
  },
  'click .buttonErrorOK': function() {
    Session.set('apiError',"");
    Session.set('apiSuccess',"");
  },
  'click #buttonEventCreateSubEvent': function() {
    Session.set('showLoading', true);
    var subEvent = makeSubEventFromSession();
    console.log(subEvent);
    if (goodSubEventFields(subEvent)) {
      Meteor.call('saveFile', subEvent, function (err, res) {
        if (err) {
          Session.set('saveError', err.error);
          Session.set('showLoading', false);
        } else {
          console.log('subevent saved');
        }
      });
      Meteor.call('eventCreateSubEvent', subEvent, function (err, res) {
        Session.set('showLoading', false);
        if (err) {
          Session.set('saveError', err.reason);
        } else {
          console.log('subevent created');
          Session.set("pageNotSaved",false);
          Session.set("subEventCreatedMsg", "Sub event " + subEvent.subEventTitle + " at " + subEvent.subEventVenue + " has been created. Create a new sub event below.");
          getSubEventSessionVars(subEvent);
        }
      });
    } else {
      Session.set('apiError', 'required fields not set');
      return;
    }
  }
});

setSubEventSessionVars = function() {
  Session.set("subEventTitle", $('#subEventTitle').val());
  Session.set("subEventMaxAttendees", $('#subEventMaxAttendees').val());
  Session.set("subEventStartsAt", $('#subEventStartsAt').val());
  Session.set("subEventHostEmail", $('#subEventHostEmail').val());
  Session.set("subEventVenue", $('#subEventVenue').val());
  Session.set("subEventAddress1", $('#subEventAddress1').val());
  Session.set("subEventAddress2", $('#subEventAddress2').val());
  Session.set("subEventCity", $('#subEventCity').val());
  Session.set("subEventState", $('#subEventState').val());
  Session.set("subEventZip", $('#subEventZip').val());
  Session.set("subEventDirections", $('#subEventDirections').val());
  Session.set("subEventPublicDescription", $('#subEventPublicDescription').val());
  Session.set("subEventNoteToAttendees", $('#subEventNoteToAttendees').val());
};

makeSubEventFromSession = function() {
  setSubEventSessionVars();
  return {
    id: Session.get("id"),
    type: 'page',
    pageType: Session.get('templateChooser'),
    notes: Session.get("notes"),
    pageTitle: Session.get("pageTitle"),
    pageName: Session.get("pageName"),
    eventDefaultTitle: Session.get("eventDefaultTitle"),
    eventDefaultSize: Session.get("eventDefaultSize"),
    eventStartDate: Session.get("eventStartDate"),
    eventStartTime: Session.get("eventStartTime"),
    pageConfEmailSL: Session.get("pageConfEmailSL"),
    pageConfEmailBody: Session.get("pageConfEmailBody"),
    pageImportConfEmailBody: Session.get("pageConfEmailBody"),
    eventUmbrellaCampaignURL: Session.get("eventUmbrellaCampaignURL"),
    eventUmbrellaHostURL: Session.get("eventUmbrellaHostURL"),
    eventUmbrellaSignupPageURL: Session.get("eventUmbrellaSignupPageURL"),
    subEventTitle: Session.get("subEventTitle"),
    subEventMaxAttendees: Session.get("subEventMaxAttendees"),
    subEventHostEmail: Session.get("subEventHostEmail"),
    subEventStartsAt: Session.get("subEventStartsAt"),
    subEventVenue: Session.get("subEventVenue"),
    subEventAddress1: Session.get("subEventAddress1"),
    subEventAddress2: Session.get("subEventAddress2"),
    subEventCity: Session.get("subEventCity"),
    subEventState: Session.get("subEventState"),
    subEventZip: Session.get("subEventZip"),
    subEventDirections: Session.get("subEventDirections"),
    subEventPublicDescription: Session.get("subEventPublicDescription"),
    subEventNoteToAttendees: Session.get("subEventNoteToAttendees"),
    creator: Session.get("creator") || Meteor.user().profile.name,
    savedBy: Meteor.user().profile.name
  }
};

getSubEventSessionVars = function(obj) {
  Session.set("subEventTitle", obj.subEventTitle);
  Session.set("subEventMaxAttendees", obj.subEventMaxAttendees);
  Session.set("subEventStartsAt", obj.subEventStartsAt);
  Session.set("subEventHostEmail", obj.subEventHostEmail);
  Session.set("subEventVenue", obj.subEventVenue);
  Session.set("subEventAddress1", obj.subEventAddress1);
  Session.set("subEventAddress2", obj.subEventAddress2);
  Session.set("subEventCity", obj.subEventCity);
  Session.set("subEventState", obj.subEventState);
  Session.set("subEventZip", obj.subEventZip);
  Session.set("subEventDirections", obj.subEventDirections);
  Session.set("subEventPublicDescription", obj.subEventPublicDescription);
  Session.set("subEventNoteToAttendees", obj.subEventNoteToAttendees);
}

goodSubEventFields = function(event) {
  return event.subEventTitle && event.subEventMaxAttendees && event.subEventStartsAt && event.subEventHostEmail
    && event.subEventVenue && event.subEventAddress1 && event.subEventCity && event.subEventState && event.subEventZip;
};

Template.templateSubEventTitle.events({
  'keyup input[type=text]': function() {
    Session.set("subEventTitle", $('#subEventTitle').val());
  }
});

Template.templateSubEventMaxAttendees.events({
  'keyup input[type=text]': function() {
    Session.set("subEventMaxAttendees", $('#subEventMaxAttendees').val());
  }
});

Template.templateSubEventHostEmail.events({
  'keyup input[type=text]': function() {
    Session.set("subEventHostEmail", $('#subEventHostEmail').val());
  }
});

Template.templateSubEventHostEmail.events({
  'keyup input[type=text]': function() {
    Session.set("subEventHostEmail", $('#subEventHostEmail').val());
  }
});

Template.templateSubEventStartsAt.events({
  'keyup input[type=text]': function() {
    Session.set("subEventStartsAt", $('#subEventStartsAt').val());
  }
});

Template.templateSubEventVenue.events({
  'keyup input[type=text]': function() {
    Session.set("subEventVenue", $('#subEventVenue').val());
  }
});

Template.templateSubEventAddress1.events({
  'keyup input[type=text]': function() {
    Session.set("subEventAddress1", $('#subEventAddress1').val());
  }
});

Template.templateSubEventAddress2.events({
  'keyup input[type=text]': function() {
    Session.set("subEventAddress2", $('#subEventAddress2').val());
  }
});

Template.templateSubEventCity.events({
  'keyup input[type=text]': function() {
    Session.set("subEventCity", $('#subEventCity').val());
  }
});

Template.templateSubEventZip.events({
  'keyup input[type=text]': function() {
    Session.set("subEventZip", $('#subEventZip').val());
  }
});

Template.templateSubEventDirections.events({
  'keyup input[type=text]': function() {
    Session.set("subEventDirections", $('#subEventDirections').val());
  }
});

Template.templateSubEventPublicDescription.events({
  'keyup input[type=text]': function() {
    Session.set("subEventPublicDescription", $('#subEventPublicDescription').val());
  }
});

Template.templateSubEventNoteToAttendees.events({
  'keyup input[type=text]': function() {
    Session.set("subEventNoteToAttendees", $('#subEventNoteToAttendees').val());
  }
});


