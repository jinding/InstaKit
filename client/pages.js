function standardizePageLinks(str) {
  // does {LINK} exist in the copy, if so, don't do anything
  if (str.search(/{ *LINK *}/i) < 0)
    //if {{page.canonical_url}} exists, replace with {LINK}
    if (str.search(/{{ *page.canonical*_url *}}/i) >= 0)
      return str.replace(/{{ *page.canonical*_url *}}/i,'{LINK}');
    else return str+' {LINK}'; // no LINK reference exist, so append
  else return str.replace(/{ *LINK *}/i, '{LINK}');
};

function setSessionVars() {
  Session.set("pageTitle", $('#pageTitle').val());
  Session.set("pageName", $('#pageName').val());
  Session.set("pageStatementLeadIn", $('#pageStatementLeadIn').val());
  Session.set("pageImportStatementLeadIn", Template.pageImportStatementLeadIn());
  Session.set("pageStatementText", $('#pageStatementText').val());
  Session.set("pageImportStatementText", Template.pageImportStatementText());
  Session.set("pageAboutText", $('#pageAboutText').val());
  Session.set("pageImportAboutText", Template.pageImportAboutText());
  Session.set("pageFacebookTitle", $('#pageFacebookTitle').val());
  Session.set("pageFacebookCopy", $('#pageFacebookCopy').val());
  Session.set("pageTwitterCopy", $('#pageTwitterCopy').val());
  Session.set("pageTAFSL", $('#pageTAFSL').val());
  Session.set("pageTAFCopy", $('#pageTAFCopy').val());
  Session.set("pageConfEmailSL", $('#pageConfEmailSL').val());
  Session.set("pageConfEmailBody", $('#pageConfEmailBody').val());
  Session.set("pageImportConfEmailBody", Template.pageImportConfEmailBody());
  Session.set("pageGraphicEmail", $('#pageGraphicEmail').val());
  Session.set("pageGraphicFacebook", $('#pageGraphicFacebook').val());
  Session.set("pageGraphicHomePage", $('#pageGraphicHomePage').val());
  Session.set("pageFacebookLength", 260 - $('#pageFacebookCopy').val().length);
  var linkLength = $('#pageTwitterCopy').val().search(/{ *LINK *}/i) < 0 ? 23 : 16;
  Session.set("pageTwitterLength", 140 - linkLength - $('#pageTwitterCopy').val().length);
}

function makePageFromSession() {
  setSessionVars();
  return {
    id: Session.get("id"),
    type: 'page',
    pageType: 'petition',
    pageTitle: Session.get("pageTitle"),
    pageName: Session.get("pageName"),
    pageStatementLeadIn: Session.get("pageStatementLeadIn"),
    pageStatementText: Session.get("pageStatementText"),
    pageAboutText: Session.get("pageAboutText"),
    pageGraphicEmail: Session.get("pageGraphicEmail"),
    pageGraphicFacebook: Session.get("pageGraphicFacebook"),
    pageGraphicHomePage: Session.get("pageGraphicHomePage"),
    pageTAFSL: Session.get("pageTAFSL"),
    pageTAFCopy: standardizePageLinks(Session.get("pageTAFCopy")), // {LINK} is added if not present
    pageFacebookTitle: Session.get("pageFacebookTitle"),
    pageFacebookCopy: Session.get("pageFacebookCopy"),
    pageTwitterCopy: standardizePageLinks(Session.get("pageTwitterCopy")), // {LINK} is added if not present
    pageConfEmailSL: Session.get("pageConfEmailSL"),
    pageConfEmailBody: Session.get("pageConfEmailBody"),
    creator: Session.get("creator") || Meteor.user().profile.name,
    savedBy: Meteor.user().profile.name,
    pageImportStatementLeadIn: Session.get("pageImportStatementLeadIn"),
    pageImportStatementText: Session.get("pageImportStatementText"),
    pageImportAboutText: Session.get("pageImportAboutText"),
    pageImportConfEmailBody: Session.get("pageImportConfEmailBody")
  }
};

function makePageAfterAPI(res) {
  setSessionVars();
  return {
    id: Session.get("id"),
    type: 'page',
    pageType: 'petition',
    pageTitle: Session.get("pageTitle"),
    pageName: Session.get("pageName"),
    pageStatementLeadIn: Session.get("pageStatementLeadIn"),
    pageStatementText: Session.get("pageStatementText"),
    pageAboutText: Session.get("pageAboutText"),
    pageGraphicEmail: Session.get("pageGraphicEmail"),
    pageGraphicFacebook: Session.get("pageGraphicFacebook"),
    pageGraphicHomePage: Session.get("pageGraphicHomePage"),
    pageTAFSL: Session.get("pageTAFSL"),
    pageTAFCopy: standardizePageLinks(Session.get("pageTAFCopy")), // {LINK} is added if not present
    pageFacebookTitle: Session.get("pageFacebookTitle"),
    pageFacebookCopy: Session.get("pageFacebookCopy"),
    pageTwitterCopy: standardizePageLinks(Session.get("pageTwitterCopy")), // {LINK} is added if not present
    pageConfEmailSL: Session.get("pageConfEmailSL"),
    pageConfEmailBody: Session.get("pageConfEmailBody"),
    creator: Session.get("creator") || Meteor.user().profile.name,
    savedBy: Meteor.user().profile.name,
    pageImportStatementLeadIn: Session.get("pageImportStatementLeadIn"),
    pageImportStatementText: Session.get("pageImportStatementText"),
    pageImportAboutText: Session.get("pageImportAboutText"),
    pageImportConfEmailBody: Session.get("pageImportConfEmailBody"),
    AKpageURL: res.AKpage,
    AKpageEditURL: res.AKpageEdit,
    AKpageBitly: res.bitly,
    pageSharePageLink: res.SPpage,
    AKpageID: res.pageID,
    AKpageResourceURI: res.resource_uri
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
  'click .buttonAPIok': function() {
    Session.set("apiError","");
    Session.set("apiSuccess","");
    Session.set("duplicatePage",false);
    Router.go('postAPI', {_id: Session.get('id')});
  },
  'click .buttonAPIupdate': function() {
    Session.set('duplicatePage',false);
    var page = makePageFromSession();
    Meteor.call('updateAKpage', page, function (error,res) {
      if (error) {
          Session.set('apiError', error.reason);
      } else {
          Session.set('apiSuccess', 'API success!');
          Session.set('apiResults', res);
          console.log('updateAKpage success',res);
//        Router.go('pages');
      }
    }); // end populateAKpage
  }, 
  'click #buttonAPI': function() {
    Session.set("apiError","");
    var page = makePageFromSession();
    // only move forward if the share text doesn't exceed length limits
    if (Session.get('pageTwitterLength') < 0 || Session.get('pageFacebookLength') < 0) {
      Session.set('apiError', 'Share text is too long. Please check Facebook and Twitter copy again.');
    } else {
      Meteor.call('saveFile', page, function (err, res) {
        if (err) {
          Session.set('saveError', err.error);
        } else {
          console.log('page saved');
          Session.set("pageNotSaved",false);
          Session.set("saveDialog",false);
        }
      });
      // first, create a page in AK with the short name
      Meteor.call('createAKpage', page, function (err,loc) {
        if (err) {
          // log and display any errors that come up from creating the page
          if (err.error === 400) {
            // duplicate page short name, ask if user wants to update that page
  //          Session.set('duplicatePage', true);
            Session.set('apiError', err.reason);
          } else {
            Session.set('apiError', err.reason);
          }
          console.log(err.reason);
        } else {
          console.log('create page success '+loc);
          Meteor.call('populateAKpage', page, loc, function (error,res) {
            if (error) {
                Session.set('apiError', error.reason);
            } else {
                Session.set('apiSuccess', 'API success!');
                Session.set('apiResults', res);
                Session.set('AKpageURL', res.AKpage);
                Session.set('AKpageEditURL', res.AKpageEdit);
                Session.set('AKpageBitly', res.bitly);
                Session.set('pageSharePageLink', res.SPpage);
                Session.set('AKpageID', res.pageID);
                Session.set('AKpageResourceURI', res.resource_uri);

                Meteor.call('saveFile', makePageAfterAPI(res), function (err, response) {
                  if (err) {
                    Session.set('saveError', err.error);
                  } else {
                    console.log('page saved');
                    Session.set("pageNotSaved",false);
                    Session.set("saveDialog",false);
                  }
                });
                console.log('populateAKpage success',res);
  //        Router.go('pages');
            }
          }); // end populateAKpage
        } // end if err
      }); // end createAKpage 
    }
  },
  'click #buttonBackToPageList': function() {
    Router.go('pages');    
  }
});

Template.postAPIpage.events({
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
    Session.set("pageFacebookLength", 260 - $('#pageFacebookCopy').val().length)
  }
});

Template.templatePageTwitterCopy.events({
  'keyup textarea, keydown textarea': function() {
    Session.set("pageTwitterCopy", $('#pageTwitterCopy').val());
    // assume 15 chars for bitly link, but if {LINK} exists then only need 9 more spaces
    var linkLength = $('#pageTwitterCopy').val().search(/{ *LINK *}/i) < 0 ? 23 : 16;
    Session.set("pageTwitterLength", 140 - linkLength - $('#pageTwitterCopy').val().length)
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
  'click .apiButton': function() {
    Router.go('postAPI', {_id: this._id});
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

