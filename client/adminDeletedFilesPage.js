Template.adminDeletedFilesPage.fileList = function() {
  // only show the files where idDeleted flag is true so that you can restore or delete them for real
  switch (Session.get("fileSort")) {
    case 'savedAtAsc': return Files.find({isDeleted: true},{sort: {when: 1}});
    case 'savedAtDesc': return Files.find({isDeleted: true},{sort: {when: -1}});
    case 'headlineAsc': return Files.find({isDeleted: true},{sort: {headline: 1}});
    case 'headlineDesc': return Files.find({isDeleted: true},{sort: {headline: -1}});
    case 'typeAsc': return Files.find({isDeleted: true},{sort: {type: 1}});
    case 'typeDesc': return Files.find({isDeleted: true},{sort: {type: -1}});
    case 'createdByAsc': return Files.find({isDeleted: true},{sort: {creator: 1}});
    case 'createdByDesc': return Files.find({isDeleted: true},{sort: {creator: -1}});
    case 'savedByAsc': return Files.find({isDeleted: true},{sort: {savedBy: 1}});
    case 'savedByDesc': return Files.find({isDeleted: true},{sort: {savedBy: -1}});
    default: Session.set("fileSort", "savedAtDesc"); return Files.find({isDeleted: true},{sort: {when: -1}});
  }
};

Template.adminDeletedFilesPage.events({
  'click #goToPages': function(evt) {
    evt.preventDefault();
    Router.go('pages');
  },
  'click #goToMailings': function(evt) {
    evt.preventDefault();
    Router.go('mailings');
  },
  'click .editButton': function(evt) {
    evt.preventDefault();
    Router.go('compose', {_id: this._id});
  },
  'click .restoreButton': function() {
    // set isDeleted flag to false; this will now reappear in the main file page list
    Files.update(this._id, {$set: {isDeleted: false}});
  },
  'click .deleteButton': function() { 
    Session.set("confirmDelete", this._id);
  },
  'click #filterButton': function() {
    if (Session.equals("filter", 'own')) {
      Session.set("filter", "all");
    } else {
      Session.set("filter", "own");
    }
  },
  'click #yesDelete': function() {
    // actually delete this from the database
    Files.remove(Session.get("confirmDelete")); 
    Session.set("confirmDelete","");
  },
  'click #cancelDelete': function() {
    Session.set("confirmDelete","");
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