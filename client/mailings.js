Template.filePage.fileList = function() {
  var sort = Session.get("fileSort");
  var username = Meteor.user().profile.name;

  // only display files where isDeleted is not true
  if (Session.equals("filter", 'all')) {
    switch (sort) {
      case 'savedAtAsc': return Files.find({type: {$ne: 'page'}, isDeleted: {$ne: true}},{sort: {when: 1}});
      case 'savedAtDesc': return Files.find({type: {$ne: 'page'}, isDeleted: {$ne: true}},{sort: {when: -1}});
      case 'headlineAsc': return Files.find({type: {$ne: 'page'}, isDeleted: {$ne: true}},{sort: {headline: 1}});
      case 'headlineDesc': return Files.find({type: {$ne: 'page'}, isDeleted: {$ne: true}},{sort: {headline: -1}});
      case 'typeAsc': return Files.find({type: {$ne: 'page'}, isDeleted: {$ne: true}},{sort: {type: 1}});
      case 'typeDesc': return Files.find({type: {$ne: 'page'}, isDeleted: {$ne: true}},{sort: {type: -1}});
      case 'createdByAsc': return Files.find({type: {$ne: 'page'}, isDeleted: {$ne: true}},{sort: {creator: 1}});
      case 'createdByDesc': return Files.find({type: {$ne: 'page'}, isDeleted: {$ne: true}},{sort: {creator: -1}});
      case 'savedByAsc': return Files.find({type: {$ne: 'page'}, isDeleted: {$ne: true}},{sort: {savedBy: 1}});
      case 'savedByDesc': return Files.find({type: {$ne: 'page'}, isDeleted: {$ne: true}},{sort: {savedBy: -1}});
      default: Session.set("fileSort", "savedAtDesc"); return Files.find({type: {$ne: 'page'}, isDeleted: {$ne: true}},{sort: {when: -1}});
    }
  } else {
    switch (sort) {
      case 'savedAtAsc': return Files.find({type: {$ne: 'page'}, isDeleted: {$ne: true}, $or: [{savedBy: username}, {creator: username}]},{sort: {when: 1}});
      case 'savedAtDesc': return Files.find({type: {$ne: 'page'}, isDeleted: {$ne: true}, $or: [{savedBy: username}, {creator: username}]},{sort: {when: -1}});
      case 'headlineAsc': return Files.find({type: {$ne: 'page'}, isDeleted: {$ne: true}, $or: [{savedBy: username}, {creator: username}]},{sort: {headline: 1}});
      case 'headlineDesc': return Files.find({type: {$ne: 'page'}, isDeleted: {$ne: true}, $or: [{savedBy: username}, {creator: username}]},{sort: {headline: -1}});
      case 'typeAsc': return Files.find({type: {$ne: 'page'}, isDeleted: {$ne: true}, $or: [{savedBy: username}, {creator: username}]},{sort: {type: 1}});
      case 'typeDesc': return Files.find({type: {$ne: 'page'}, isDeleted: {$ne: true}, $or: [{savedBy: username}, {creator: username}]},{sort: {type: -1}});
      case 'createdByAsc': return Files.find({type: {$ne: 'page'}, isDeleted: {$ne: true}, $or: [{savedBy: username}, {creator: username}]},{sort: {creator: 1}});
      case 'createdByDesc': return Files.find({type: {$ne: 'page'}, isDeleted: {$ne: true}, $or: [{savedBy: username}, {creator: username}]},{sort: {creator: -1}});
      case 'savedByAsc': return Files.find({type: {$ne: 'page'}, isDeleted: {$ne: true}, $or: [{savedBy: username}, {creator: username}]},{sort: {savedBy: 1}});
      case 'savedByDesc': return Files.find({type: {$ne: 'page'}, isDeleted: {$ne: true}, $or: [{savedBy: username}, {creator: username}]},{sort: {savedBy: -1}});
      default: Session.set("fileSort", "savedAtDesc"); return Files.find({type: {$ne: 'page'}, isDeleted: {$ne: true}, $or: [{savedBy: username}, {creator: username}]},{sort: {when: -1}});
    }
  }
};


Template.filePage.filterButtonText = function() {
  if (Session.equals("filter","all")) {
    return "show my emails";
  } else {
    return "show all";
  }
}

Template.filePage.events({
  // go to restore files page -- only for admins
  'click #restoreLink': function(evt) {
    evt.preventDefault();
    Router.go('restore');
  },
  // compose email chooser functions
  'click #templateChooser_petition': function(evt) {
    evt.preventDefault();
    Router.go('compose', 
                {}, 
                {query: {template: 'petition'}}
              );
  },
  'click #templateChooser_takeaction': function(evt) {
    evt.preventDefault();
    Router.go('compose', 
                {}, 
                {query: {template: 'takeaction'}}
              );
  },
  'click #templateChooser_publicComment': function(evt) {
    evt.preventDefault();
    Router.go('compose', 
                {}, 
                {query: {template: 'public comment'}}
              );
  },
  'click #templateChooser_call': function(evt) {
    evt.preventDefault();
    Router.go('compose', 
                {}, 
                {query: {template: 'call'}}
              );
  },
  'click #templateChooser_event': function(evt) {
    evt.preventDefault();
    Router.go('compose', 
                {}, 
                {query: {template: 'event'}}
              );
  },
  'click #templateChooser_mobilize': function(evt) {
    evt.preventDefault();
    Router.go('compose', 
                {}, 
                {query: {template: 'mobilize'}}
              );
  },
  'click #templateChooser_blank': function(evt) {
    evt.preventDefault();
    Router.go('compose', 
                {}, 
                {query: {template: 'blank'}}
              );
  },
  // edit, copy and delete functions
  'click #logoutButton': function() {
    Meteor.logout();
  },
  'click .editButton': function(evt) {
    evt.preventDefault();
    Router.go('compose', {_id: this._id});
  },
  'click .copyButton': function() {
    Router.go('compose', 
                {}, 
                {query: {copy: this._id}}
              );
  },
  'click .deleteButton': function() { 
    Session.set("confirmDelete", this._id);
  },
  'click #filterButton': function() {
    if (Session.equals("filter", 'all')) {
      Session.set("filter", "own");
    } else {
      Session.set("filter", "all");
    }
  },
  'click #yesDelete': function() {
    Files.update(Session.get("confirmDelete"), {$set: {isDeleted: true}});
    Session.set("confirmDelete","");
  },
  'click #cancelDelete': function() {
    Session.set("confirmDelete","");
  },
  // sorting functions
  'click #sortSavedAt': function() {
    if (Session.equals("fileSort","savedAtAsc")) {
      Session.set("fileSort", "savedAtDesc");
    } else {
      Session.set("fileSort","savedAtAsc");
    }
  },
  'click #sortHeadline': function() {
    if (Session.equals("fileSort","headlineAsc")) {
      Session.set("fileSort", "headlineDesc");
    } else {
      Session.set("fileSort","headlineAsc");
    }
  },
  'click #sortType': function() {
    if (Session.equals("fileSort","typeAsc")) {
      Session.set("fileSort", "typeDesc");
    } else {
      Session.set("fileSort","typeAsc");
    }
  },
  'click #sortCreatedBy': function() {
    if (Session.equals("fileSort","createdByAsc")) {
      Session.set("fileSort", "createdByDesc");
    } else {
      Session.set("fileSort","createdByAsc");
    }
  },
  'click #sortSavedBy': function() {
    if (Session.equals("fileSort","savedByAsc")) {
      Session.set("fileSort", "savedByDesc");
    } else {
      Session.set("fileSort","savedByAsc");
    }
  },
});

