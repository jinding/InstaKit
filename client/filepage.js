Template.filePage.fileList = function() {
  var sort = Session.get("fileSort");
  var username = Meteor.user().profile.name;

  if (Session.equals("filter", 'own')) {
    switch (sort) {
      case 'savedAtAsc': return Files.find({$or: [{savedBy: username}, {creator: username}]},{sort: {when: 1}});
      case 'savedAtDesc': return Files.find({$or: [{savedBy: username}, {creator: username}]},{sort: {when: -1}});
      case 'headlineAsc': return Files.find({$or: [{savedBy: username}, {creator: username}]},{sort: {headline: 1}});
      case 'headlineDesc': return Files.find({$or: [{savedBy: username}, {creator: username}]},{sort: {headline: -1}});
      case 'typeAsc': return Files.find({$or: [{savedBy: username}, {creator: username}]},{sort: {type: 1}});
      case 'typeDesc': return Files.find({$or: [{savedBy: username}, {creator: username}]},{sort: {type: -1}});
      case 'createdByAsc': return Files.find({$or: [{savedBy: username}, {creator: username}]},{sort: {creator: 1}});
      case 'createdByDesc': return Files.find({$or: [{savedBy: username}, {creator: username}]},{sort: {creator: -1}});
      case 'savedByAsc': return Files.find({$or: [{savedBy: username}, {creator: username}]},{sort: {savedBy: 1}});
      case 'savedByDesc': return Files.find({$or: [{savedBy: username}, {creator: username}]},{sort: {savedBy: -1}});
      default: Session.set("fileSort", "savedAtDesc"); return Files.find({$or: [{savedBy: username}, {creator: username}]},{sort: {when: -1}});
    }
  } else {
    switch (sort) {
      case 'savedAtAsc': return Files.find({},{sort: {when: 1}});
      case 'savedAtDesc': return Files.find({},{sort: {when: -1}});
      case 'headlineAsc': return Files.find({},{sort: {headline: 1}});
      case 'headlineDesc': return Files.find({},{sort: {headline: -1}});
      case 'typeAsc': return Files.find({},{sort: {type: 1}});
      case 'typeDesc': return Files.find({},{sort: {type: -1}});
      case 'createdByAsc': return Files.find({},{sort: {creator: 1}});
      case 'createdByDesc': return Files.find({},{sort: {creator: -1}});
      case 'savedByAsc': return Files.find({},{sort: {savedBy: 1}});
      case 'savedByDesc': return Files.find({},{sort: {savedBy: -1}});
      default: Session.set("fileSort", "savedAtDesc"); return Files.find({},{sort: {when: -1}});
    }
  }
};

Template.filePage.headlineButtonText = function() {
  switch (Session.get("fileSort")) {
    case 'headlineAsc': return "▲";
    case 'headlineDesc': return '▼';
    default: return '—';
  }
}

Template.filePage.typeButtonText = function() {
  switch (Session.get("fileSort")) {
    case 'typeAsc': return "▲";
    case 'typeDesc': return '▼';
    default: return '—';
  }
}

Template.filePage.createdByButtonText = function() {
  switch (Session.get("fileSort")) {
    case 'createdByAsc': return "▲";
    case 'createdByDesc': return '▼';
    default: return '—';
  }
}

Template.filePage.savedByButtonText = function() {
  switch (Session.get("fileSort")) {
    case 'savedByAsc': return "▲";
    case 'savedByDesc': return '▼';
    default: return '—';
  }
}

Template.filePage.savedAtButtonText = function() {
  switch (Session.get("fileSort")) {
    case 'savedAtAsc': return "▲";
    case 'savedAtDesc': return '▼';
    default: return '—';
  }
}
Template.filePage.currentUserName = function() {
  return Meteor.user().profile.name;
}

Template.filePage.belongsToUser = function(name) {
  return Meteor.user().profile.name === name ? true : false;
}

Template.filePage.filterButtonText = function() {
  if (Session.equals("filter","own")) {
    return "show all";
  } else {
    return "show my emails";
  }
}


Template.filePage.events({
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
  }
}); 

Template.filePage.events({
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
    Session.set("delete", this._id);
  },
  'click #filterButton': function() {
    if (Session.equals("filter", 'own')) {
      Session.set("filter", "all");
    } else {
      Session.set("filter", "own");
    }
  },
  'click #yesDelete': function() {
    Files.remove(Session.get("delete"));
    Session.set("delete","");
  },
  'click #cancelDelete': function() {
    Session.set("delete","");
  },
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

Template.filePage.isAdmin = function() {
  var admins = new Array('Jin Ding');
  return admins.indexOf(Meteor.user().profile.name) >= 0 ? true : false;
}
