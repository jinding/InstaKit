
function setEventSessionVars() {
  var converter = new Showdown.converter();
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
  var converter = new Showdown.converter();

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
    savedBy: Meteor.user().profile.name
  }
};

function goodFields(event) {
  console.log(event.pageTitle);
  console.log(event.pageName);
  console.log(event.eventDefaultTitle);
  console.log(event.eventDefaultSize);
  console.log(event.eventMaxSize);
  console.log(event.eventStartDate);
  console.log(event.eventStartTime);

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
        console.log('page saved');
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
        console.log('page saved');
        Session.set("pageNotSaved",false);
        Session.set("saveDialog",false);
        if (goodFields(eventUmbrella)) {
          Meteor.call('eventCreateUmbrella', eventUmbrella, function (err2,res2) {
            if (err2) {
                Session.set('apiError', err2.reason);
            } else {
                console.log('event umbrella created');
                console.log(res2);
                Meteor.call('eventCreateHostPage', res2, eventUmbrella, function (err3, res3) {
                  if (err3) {
                      Session.set('apiError', err3.reason);
                  } else {
                    Session.set('apiSuccess',"Event umbrella created successfully");
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

