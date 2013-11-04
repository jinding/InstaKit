function makePageFromSession() {
  return {
    id: Session.get("id"),
    type: 'page',
    pageType: 'petition',
    pageTitle: Session.get("pageTitle"),
    pageName: Session.get("pageName"),
    pageStatementLeadIn: Session.get("pageImportStatementLeadIn"),
    pageStatementText: Session.get("pageImportStatementText"),
    pageAboutText: Session.get("pageImportAboutText"),
    pageGraphicEmail: Session.get("pageGraphicEmail"),
    pageGraphicFacebook: Session.get("pageGraphicFacebook"),
    pageGraphicHomePage: Session.get("pageGraphicHomePage"),
    pageSharePageLink: Session.get("pageSharePageLink"),
    pageTAFSL: Session.get("pageTAFSL"),
    pageTAFCopy: Session.get("pageTAFCopy"),
    pageFacebookTitle: Session.get("pageFacebookTitle"),
    pageFacebookCopy: Session.get("pageFacebookCopy"),
    pageTwitterCopy: Session.get("pageTwitterCopy"),
    pageConfEmailSL: Session.get("pageConfEmailSL"),
    pageConfEmailBody: Session.get("pageImportConfEmailBody"),
    creator: Session.get("creator") || Meteor.user().profile.name,
    savedBy: Meteor.user().profile.name
  }
};

Template.createPage.events({
  'keyup input[type=text], keyup textarea': function() {
    Session.set("pageNotSaved",true);
  },
  'click #buttonSavePage': function() {
    if (Session.get("newPage")
        || Session.equals("creator", Meteor.user().profile.name)) {
      Meteor.call('saveFile', makePageFromSession(), function (err, res) {
        if (err) {
          Session.set('saveError', err.error);
        } else {
        console.log('page saved');
        Session.set("pageNotSaved",false);
        Router.go('pages');
        }
      });
    } else {
      Session.set("saveDialog",true);
    }
  },
  'click #buttonAPI': function() {
    Meteor.call('saveFile', makePageFromSession(), function (err, res) {
      if (err) {
        Session.set('saveError', err.error);
      } else {
        console.log('page saved');
        Session.set("pageNotSaved",false);
        Session.set("saveDialog",false);
      }
    });
    Meteor.call('createAKpage', makePageFromSession(), function (err,res) {
     if (err) {
        Session.set('APIerror', err.error);
        console.log(err);
      } else {
        console.log('api success');
        Router.go('pages');
      }
    });
  },
  'click #buttonBackToPageList': function() {
    Router.go('pages');    
  }
});

Template.templatePageTitle.events({
  'keyup input[type=text], keydown input[type=text]': function() {
    Session.set("pageTitle", $('#pageTitle').val());
  }
});

Template.templatePageName.events({
  'keyup input[type=text], keydown input[type=text]': function() {
    Session.set("pageName", $('#pageName').val());
  }
});

Template.templatePageStatement.events({
  'keyup input, keydown input': function() {
    Session.set("pageStatementLeadIn", $('#pageStatementLeadIn').val());
    Session.set("pageImportStatementLeadIn", Template.pageImportStatementLeadIn());
  },
  'keyup textarea, keydown textarea': function() {
    Session.set("pageStatementText", $('#pageStatementText').val());
    Session.set("pageImportStatementText", Template.pageImportStatementText());
  }
});

Template.templatePageAboutText.events({
  'keyup textarea, keydown textarea': function() {
    Session.set("pageAboutText", $('#pageAboutText').val());
    Session.set("pageImportAboutText", Template.pageImportAboutText());
  }
});

Template.templatePageFacebook.events({
  'keyup input[type=text], keydown input[type=text]': function() {
    Session.set("pageFacebookTitle", $('#pageFacebookTitle').val());
  },
  'keyup textarea, keydown textarea': function() {
    Session.set("pageFacebookCopy", $('#pageFacebookCopy').val());
  }
});

Template.templatePageTwitterCopy.events({
  'keyup textarea, keydown textarea': function() {
    Session.set("pageTwitterCopy", $('#pageTwitterCopy').val());
  }
});

Template.templatePageTAF.events({
  'keyup input[type=text], keydown input[type=text]': function() {
    Session.set("pageTAFSL", $('#pageTAFSL').val());
  },
  'keyup textarea, keydown textarea': function() {
    Session.set("pageTAFCopy", $('#pageTAFCopy').val());
  }
});

Template.templatePageConfEmail.events({
  'keyup input[type=text], keydown input[type=text]': function() {
    Session.set("pageConfEmailSL", $('#pageConfEmailSL').val());
    Session.set("pageConfEmailBody", $('#pageConfEmailBody').val());
    Session.set("pageImportConfEmailBody", Template.pageImportConfEmailBody());
},
  'keyup textarea, keydown textarea': function() {
    Session.set("pageConfEmailBody", $('#pageConfEmailBody').val());
    Session.set("pageImportConfEmailBody", Template.pageImportConfEmailBody());
  }
});

Template.templatePageSharePageLink.events({
  'keyup input[type=text], keydown input[type=text]': function() {
    Session.set("pageSharePageLink", $('#pageSharePageLink').val());
  }
});

Template.templatePageGraphics.events({
  'keyup #pageGraphicEmail, keydown #pageGraphicEmail': function() {
    Session.set("pageGraphicEmail", $('#pageGraphicEmail').val());
  },
  'keyup #pageGraphicFacebook, keydown #pageGraphicFacebook': function() {
    Session.set("pageGraphicFacebook", $('#pageGraphicFacebook').val());
  },
  'keyup #pageGraphicHomePage, keydown #pageGraphicHomePage': function() {
    Session.set("pageGraphicHomePage", $('#pageGraphicHomePage').val());
  }
});

Template.createPageDisplay.importData = function() {
	return Session.set("pageImportAboutText", Template.pageCreationDisplay());
};

Template.pages.fileList = function() {
  var sort = Session.get("fileSort");
  var username = Meteor.user().profile.name;

  // only display files where isDeleted is not true
  if (Session.equals("filter", 'all')) {
    switch (sort) {
      case 'savedAtAsc': return Files.find({type: 'page', isDeleted: {$ne: true}},{sort: {when: 1}});
      case 'savedAtDesc': return Files.find({type: 'page', isDeleted: {$ne: true}},{sort: {when: -1}});
      case 'headlineAsc': return Files.find({type: 'page', isDeleted: {$ne: true}},{sort: {headline: 1}});
      case 'headlineDesc': return Files.find({type: 'page', isDeleted: {$ne: true}},{sort: {headline: -1}});
      case 'typeAsc': return Files.find({type: 'page', isDeleted: {$ne: true}},{sort: {type: 1}});
      case 'typeDesc': return Files.find({type: 'page', isDeleted: {$ne: true}},{sort: {type: -1}});
      case 'createdByAsc': return Files.find({type: 'page', isDeleted: {$ne: true}},{sort: {creator: 1}});
      case 'createdByDesc': return Files.find({type: 'page', isDeleted: {$ne: true}},{sort: {creator: -1}});
      case 'savedByAsc': return Files.find({type: 'page', isDeleted: {$ne: true}},{sort: {savedBy: 1}});
      case 'savedByDesc': return Files.find({type: 'page', isDeleted: {$ne: true}},{sort: {savedBy: -1}});
      default: Session.set("fileSort", "savedAtDesc"); return Files.find({type: 'page', isDeleted: {$ne: true}},{sort: {when: -1}});
    }
  } else {
    switch (sort) {
      case 'savedAtAsc': return Files.find({type: 'page', isDeleted: {$ne: true}, $or: [{savedBy: username}, {creator: username}]},{sort: {when: 1}});
      case 'savedAtDesc': return Files.find({type: 'page', isDeleted: {$ne: true}, $or: [{savedBy: username}, {creator: username}]},{sort: {when: -1}});
      case 'headlineAsc': return Files.find({type: 'page', isDeleted: {$ne: true}, $or: [{savedBy: username}, {creator: username}]},{sort: {headline: 1}});
      case 'headlineDesc': return Files.find({type: 'page', isDeleted: {$ne: true}, $or: [{savedBy: username}, {creator: username}]},{sort: {headline: -1}});
      case 'typeAsc': return Files.find({type: 'page', isDeleted: {$ne: true}, $or: [{savedBy: username}, {creator: username}]},{sort: {type: 1}});
      case 'typeDesc': return Files.find({type: 'page', isDeleted: {$ne: true}, $or: [{savedBy: username}, {creator: username}]},{sort: {type: -1}});
      case 'createdByAsc': return Files.find({type: 'page', isDeleted: {$ne: true}, $or: [{savedBy: username}, {creator: username}]},{sort: {creator: 1}});
      case 'createdByDesc': return Files.find({type: 'page', isDeleted: {$ne: true}, $or: [{savedBy: username}, {creator: username}]},{sort: {creator: -1}});
      case 'savedByAsc': return Files.find({type: 'page', isDeleted: {$ne: true}, $or: [{savedBy: username}, {creator: username}]},{sort: {savedBy: 1}});
      case 'savedByDesc': return Files.find({type: 'page', isDeleted: {$ne: true}, $or: [{savedBy: username}, {creator: username}]},{sort: {savedBy: -1}});
      default: Session.set("fileSort", "savedAtDesc"); return Files.find({type: 'page', isDeleted: {$ne: true}, $or: [{savedBy: username}, {creator: username}]},{sort: {when: -1}});
    }
  }
};

Template.pages.filterButtonText = function() {
  if (Session.equals("filter","all")) {
    return "show my pages";
  } else {
    return "show all";
  }
}
Template.pages.events({
  // go to restore files page -- only for admins
  'click #restoreLink': function(evt) {
    evt.preventDefault();
    Router.go('restore');
  },
  // compose email chooser functions
  'click #templateChooser_petition': function(evt) {
    evt.preventDefault();
    Router.go('createPage', 
                {}, 
                {query: {template: 'petition'}}
              );
  },
  // edit, copy and delete functions
  'click #logoutButton': function() {
    Meteor.logout();
  },
  'click .editButton': function(evt) {
    evt.preventDefault();
    Router.go('createPage', {_id: this._id});
  },
  'click .copyButton': function() {
    Router.go('createPage', 
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

Template.savePageDialog.events({
  'click #cancelSave': function() {
      Session.set("saveDialog",false);
  },
  'click #yesSave': function() {
    Meteor.call('saveFile', makePageFromSession(), function (err, res) {
      if (err) {
        Session.set('saveError', err.error);
      } else {
        console.log('page saved');
        Session.set("pageNotSaved",false);
        Session.set("saveDialog",false);
        Router.go('pages');
      }
    });
  }
});

