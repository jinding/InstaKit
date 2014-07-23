// ======================== Event Umbrella functions ======================== //

Template.templateEventDefaultTitle.events({
  'keyup input[type=text]': function() {
    Session.set("eventDefaultTitle", $('#eventDefaultTitle').val());
  }
});

Template.templateEventDefaultSize.events({
  'keyup input[type=text]': function() {
    Session.set("eventDefaultSize", $('#eventDefaultSize').val());
  }
});

Template.templateEventMaxSize.events({
  'keyup input[type=text]': function() {
    Session.set("eventMaxSize", $('#eventMaxSize').val());
  }
});

Template.templateEventStartDate.events({
  'keyup input[type=text]': function() {
    Session.set("eventStartDate", $('#eventStartDate').val());
  }
});

Template.templateEventStartTime.events({
  'keyup input[type=text]': function() {
    Session.set("eventStartTime", $('#eventStartTime').val());
  }
});

function setEventSessionVars() {
  Session.set("pageTitle", $('#pageTitle').val());
  Session.set("notes", $('#pageNotes').val());
  Session.set("pageName", $('#pageName').val());
  Session.set("eventDefaultTitle", $('#eventDefaultTitle').val());
  Session.set("eventDefaultSize", $('#eventDefaultSize').val());
  Session.set("eventMaxSize", $('#eventMaxSize').val());
  Session.set("eventStartDate", $('#eventStartDate').val());
  Session.set("eventStartTime", $('#eventStartTime').val());
}

function makeEventUmbrellaFromSession() {
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
    eventMaxSize: Session.get("eventMaxSize"),
    eventStartDate: Session.get("eventStartDate"),
    eventStartTime: Session.get("eventStartTime"),
    creator: Session.get("creator") || Meteor.user().profile.name,
    savedBy: Meteor.user().profile.name,
    eventUmbrellaCampaignURL: Session.get("eventUmbrellaCampaignURL"),
    eventUmbrellaHostURL: Session.get("eventUmbrellaHostURL"),
    eventUmbrellaSignupPageURL: Session.get("eventUmbrellaSignupPageURL")
  }
};

function goodEventUmbrellaFields(event) {
  return event.pageTitle && event.pageName && event.eventDefaultTitle && event.eventDefaultSize && event.eventMaxSize && event.eventStartDate && event.eventStartTime;
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
  'click .buttonErrorOK': function() {
    Session.set('apiError',"");
    Session.set('apiSuccess',"");
  },
  'click #buttonEventCreateUmbrella': function() {
    var eventUmbrella = makeEventUmbrellaFromSession();
    Meteor.call('saveFile', eventUmbrella, function (err, res) {
      if (err) {
        Session.set('saveError', err.error);
      } else {
        console.log('page saved: ' + res.id);
        console.log(this._id);
        Session.set('id', this._id);
        Session.set("pageNotSaved",false);
        Session.set("saveDialog",false);
        if (goodEventUmbrellaFields(eventUmbrella)) {
          Meteor.call('eventCreateUmbrella', eventUmbrella, function (err2,res2) {
            if (err2) {
                Session.set('apiError', err2.reason);
            } else {
                console.log('event umbrella created successfully');
                console.log(res2);
                Session.set('eventUmbrellaCampaignURL', res2);
                Meteor.call('eventCreateHostPage', res2, eventUmbrella, function (err3, res3) {
                  if (err3) {
                      Session.set('apiError', err3.reason);
                  } else {
                    Session.set('eventUmbrellaHostURL', res3);
                    console.log("Event host page created successfully");
                    eventUmbrella = makeEventUmbrellaFromSession();
                    Meteor.call('eventCreateSignupPage', eventUmbrella, function (err4, res4) {
                      if (err4) {
                          Session.set('apiError', err4.reason);
                      } else {
                        Session.set('eventUmbrellaSignupPageURL', res4);
                        console.log('Event signup page created successfully');
                        eventUmbrella = makeEventUmbrellaFromSession();
                        Meteor.call('saveFile', eventUmbrella, function (err5, res5) {
                          if (err4) {
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
  'click .buttonErrorOK': function() {
    Session.set('apiError',"");
    Session.set('apiSuccess',"");
  },
  'click #buttonEventCreateSubEvent': function() {
    var subEvent = makeSubEventFromSession();
    console.log(subEvent);
    if (goodSubEventFields(subEvent)) {
      Meteor.call('eventCreateSubEvent', subEvent, function (err, res) {
        if (err) {
          Session.set('saveError', err.reason);
        } else {
          console.log('subevent created');
          Session.set("pageNotSaved",false);
          Session.set("subEventCreatedMsg", "Sub event " + subEvent.subEventTitle + " has been created.");
        }
      });
    } else {
      Session.set('apiError', 'required fields not set');
      return;
    }
  }
});

function setSubEventSessionVars() {
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
}

function makeSubEventFromSession() {
  setSubEventSessionVars();
  return {
    id: Session.get("id"),
    type: 'subEvent',
    pageType: 'subEvent',
    eventUmbrellaCampaignURL: Session.get("eventUmbrellaCampaignURL"),
    eventUmbrellaHostURL: Session.get("eventUmbrellaHostURL"),
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

function goodSubEventFields(event) {
  return event.subEventTitle && event.subEventMaxAttendees && event.subEventStartsAt && event.subEventHostEmail
    && event.subEventVenue && event.subEventAddress1 && event.subEventCity && event.subEventState && event.subEventZip;
}
