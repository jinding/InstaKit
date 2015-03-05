standardizePageLinks = function(str) {
  // does {LINK} exist in the copy, if so, don't do anything
  if (str.search(/{ *LINK *}/i) < 0)
    //if {{page.canonical_url}} exists, replace with {LINK}
    if (str.search(/{{ *page.canonical*_url *}}/i) >= 0)
      return str.replace(/{{ *page.canonical*_url *}}/i,'{LINK}');
    else return str+' {LINK}'; // no LINK reference exist, so append
  else return str.replace(/{ *LINK *}/i, '{LINK}');
};

setImageLinksToCloudfront = function(str) {
  if (str.search(/ *https/i) >= 0) // if https exist in the copy, change to http
    str = str.replace(/ *https/i, 'http');
  if (str.search(/s3.amazonaws.com\/s3.credoaction.com/i) >= 0) // if s3 exists in the copy, change to cloudfront
    str = str.replace(/s3.amazonaws.com\/s3.credoaction.com/i, 'd2omw6a1nm6pnh.cloudfront.net');
  return str;
};

setSessionVars = function() {
  var converter = new Showdown.converter();
  Session.set("pageTitle", $('#pageTitle').val());
  Session.set("notes", $('#pageNotes').val());
  Session.set("pageName", $('#pageName').val());
  Session.set("pageStatementLeadIn", $('#pageStatementLeadIn').val());
  Session.set("pageImportStatementLeadIn", converter.makeHtml(Session.get("pageStatementLeadIn")));
  Session.set("pageStatementText", $('#pageStatementText').val());
  Session.set("pageImportStatementText", converter.makeHtml(Session.get("pageStatementText")));
  Session.set("pageAboutText", $('#pageAboutText').val());
  Session.set("pageImportAboutText", converter.makeHtml(Session.get("pageAboutText")));
  Session.set("pageFacebookTitle", $('#pageFacebookTitle').val());
  Session.set("pageFacebookCopy", $('#pageFacebookCopy').val());
  Session.set("pageTwitterCopy", removeCurlyQuotes($('#pageTwitterCopy').val()));
  Session.set("pageTAFSL", removeCurlyQuotes($('#pageTAFSL').val()));
  Session.set("pageTAFCopy", removeCurlyQuotes($('#pageTAFCopy').val()));
  Session.set("pageConfEmailSL", $('#pageConfEmailSL').val());
  Session.set("pageConfEmailBody", $('#pageConfEmailBody').val());
  Session.set("pageImportConfEmailBody", converter.makeHtml(Session.get("pageConfEmailBody")));
  Session.set("pageGraphicEmail", $('#pageGraphicEmail').val());
  Session.set("pageGraphicFacebook", $('#pageGraphicFacebook').val());
  Session.set("pageGraphicHomePage", $('#pageGraphicHomePage').val());
  Session.set("pageFacebookLength", 260 - $('#pageFacebookCopy').val().length);
  var linkLength = $('#pageTwitterCopy').val().search(/{ *LINK *}/i) < 0 ? 23 : 16;
  Session.set("pageTwitterLength", 140 - linkLength - $('#pageTwitterCopy').val().length);
}

makePageFromSession = function() {
  setSessionVars();
  var converter = new Showdown.converter();

  return {
    id: Session.get("id"),
    type: 'page',
    pageType: Session.get('templateChooser'),
    notes: Session.get("notes"),
    pageTitle: Session.get("pageTitle"),
    pageName: Session.get("pageName"),
    pageStatementLeadIn: Session.get("pageStatementLeadIn"),
    pageStatementText: Session.get("pageStatementText"),
    pageAboutText: Session.get("pageAboutText"),
    pageGraphicEmail: setImageLinksToCloudfront(Session.get("pageGraphicEmail")),
    pageGraphicFacebook: setImageLinksToCloudfront(Session.get("pageGraphicFacebook")),
    pageGraphicHomePage: setImageLinksToCloudfront(Session.get("pageGraphicHomePage")),
    pageTAFSL: Session.get("pageTAFSL"),
    pageTAFCopy: standardizePageLinks(Session.get("pageTAFCopy")), // {LINK} is added if not present
    pageFacebookTitle: Session.get("pageFacebookTitle"),
    pageFacebookCopy: Session.get("pageFacebookCopy"),
    pageTwitterCopy: standardizePageLinks(Session.get("pageTwitterCopy")), // {LINK} is added if not present
    pageConfEmailSL: Session.get("pageConfEmailSL"),
    pageConfEmailBody: Session.get("pageConfEmailBody"),
    creator: Session.get("creator") || Meteor.user().profile.name,
    savedBy: Meteor.user().profile.name,
    pageImportStatementLeadIn: converter.makeHtml(Session.get("pageStatementLeadIn")),
    pageImportStatementText: converter.makeHtml(Session.get("pageStatementText")),
    pageImportAboutText: converter.makeHtml(Session.get("pageAboutText")),
    pageImportConfEmailBody: converter.makeHtml(Session.get("pageConfEmailBody")),
    AKpageURL: Session.get("AKpageURL"),
    AKpageEditURL: Session.get("AKpageEditURL"),
    AKpageBitly: Session.get("AKpageBitly"),
    pageSharePageLink: Session.get("pageSharePageLink"),
    AKpageID: Session.get("AKpageID"),
    AKpageResourceURI: Session.get("AKpageResourceURI")
  }
};

Template.createPage.events({
  'keyup input[type=text], keyup textarea': function() {
    Session.set("pageNotSaved",true);
  },
  'click #createPageDisplay': function() {
    Session.set("snippets",false);
    Session.set("toolTips",false);
  },
  'click #toolTips': function() {
      if (Session.get("toolTips")) {
        Session.set("toolTips",false);
      } else {
        Session.set("toolTips",true);
        Session.set("snippets",false);
      }
  },
  'click #snippets': function() {
      if (Session.get("snippets")) {
        Session.set("snippets",false);
      } else {
        Session.set("snippets",true);
        Session.set("toolTips",false);
      }
  },  
  'click #buttonMakeEmail': function() {
    var page = makePageFromSession();
    // save page first then create email
    Meteor.call('saveFile', page, function (err, res) {
      if (err) {
        Session.set('saveError', err.error);
      } else {
        console.log('page saved');
        console.log('if new page, upsert id ' + res.insertedId);
        Session.set("pageNotSaved",false);
        Session.set("saveDialog",false);
        // if this page has not already been saved and does not yet have an ID, set the ID to the insertedID
        var ID = Session.get('id') ? Session.get('id') : res.insertedId;
        Session.set('id', ID); 
        // go to compose mailing page, pulling data from the saved page
        Router.go('compose', {}, {query: {page: ID}});
      }
    });
  },
  'click #buttonSavePage': function() {
    if (Session.get("newPage")
        || Session.equals("creator", Meteor.user().profile.name)) {
      Meteor.call('saveFile', makePageFromSession(), function (err, res) {
        if (err) {
          Session.set('saveError', err.error);
        } else {
          console.log('page saved');
          console.log('upsert id ' + res.insertedId);
          if (!Session.get('id')) { Session.set('id', res.insertedId); }
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
  'click #buttonAPIupdate': function() {
    Session.set('duplicatePage',false);
    var page = makePageFromSession();
    // only move forward if the share text doesn't exceed length limits
    if (Session.get('pageTwitterLength') < 0 || Session.get('pageFacebookLength') < 0) {
      Session.set('apiError', 'Share text is too long. Please check Facebook and Twitter copy again.');
    } else {
      // first, save the page
      Meteor.call('saveFile', page, function (err, res) {
        if (err) {
          Session.set('saveError', err.error);
        } else {
          console.log('page saved');
          console.log('upsert id ' + res.insertedId);
          if (!Session.get('id')) { Session.set('id', res.insertedId); }
          Session.set("pageNotSaved",false);
          Session.set("saveDialog",false);
        }
      });
      // edit created AK page
      Meteor.call('updateAKpage', page, function (error,res) {
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

          page.AKpageURL = res.AKpage;
          page.AKpageBitly = res.bitly;
          page.pageSharePageLink = res.SPpage;

          // save the page again with new page_url, bitly and share page links
          Meteor.call('saveFile', page, function (err, res) {
            if (err) {
              Session.set('saveError', err.error);
            } else {
              console.log('page saved');
              Session.set("pageNotSaved",false);
              Session.set("saveDialog",false);
            }
          });
          console.log('updateAKpage success',res);
        }
      }); // end updateAKpage
    } // end if share text is within length limits
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
          console.log('page saved in click #buttonAPI');
          console.log('upsert id ' + res.insertedId);
          if (!Session.get('id')) { 
            Session.set('id', res.insertedId); 
            page = makePageFromSession(); 
            console.log('page id ' + page.id);
          }
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

                page.AKpageURL = res.AKpage;
                page.AKpageEditURL = res.AKpageEdit;
                page.AKpageURL = res.AKpage;
                page.AKpageBitly = res.bitly;
                page.pageSharePageLink = res.SPpage;
                page.AKpageID = res.pageID;
                page.AKpageResourceURI = res.resource_uri;

                Meteor.call('saveFile', page, function (err, response) {
                  if (err) {
                    Session.set('saveError', err.error);
                  } else {
                    console.log('page saved');
                    Session.set("pageNotSaved",false);
                    Session.set("saveDialog",false);
                  }
                });
                console.log('populateAKpage success',res);
            }
          }); // end populateAKpage
        } // end if err
      }); // end createAKpage 
    }
  },
  'click #buttonBackToPageList': function() {
    Router.go('pages');    
  },
  'click #userCity': function() {
      insertAtCaret('pageAboutText',"{{ user.city|default:\"your city\" }}");
  },
  'click #userStateAbbrev': function() {
      insertAtCaret('pageAboutText',"{{ user.state|default:\"your state\" }}");
  },
  'click #userStateName': function() {
      insertAtCaret('pageAboutText',"{{ user.state\\_name|default:\"your state\" }}");
  },
  'click #userZip': function() {
      insertAtCaret('pageAboutText',"{{ user.zip }}");
  },
  'click #targetAbbrev': function() {
      insertAtCaret('pageAboutText',"{% requires\\_value targets.title\\_last %}{{ targets.title\\_last }}");
  },
  'click #targetFullTitle': function() {
      insertAtCaret('pageAboutText',"{% requires\\_value targets.title\\_full %}{{ targets.title\\_full }}");
  },
  'click #targetFullName': function() {
      insertAtCaret('pageAboutText',"{% requires\\_value targets.full\\_name %}{{ targets.full\\_name }}");
  },
  'click #targetLastName': function() {
      insertAtCaret('pageAboutText',"{% requires\\_value targets.last %}{{ targets.last }}");
  },
  'click #pluralThem': function() {
      insertAtCaret('pageAboutText',"{% requires\\_value targets.count %}{{ targets.them }}");
  },
  'click #pluralThey': function() {
      insertAtCaret('pageAboutText',"{% requires\\_value targets.they %}{{ targets.they }}");
  },
  'click #pluralTheir': function() {
      insertAtCaret('pageAboutText',"{% requires\\_value targets.their %}{{ targets.their }}");
  },
  'click #pluralTheirs': function() {
      insertAtCaret('pageAboutText',"{% requires\\_value targets.theirs %}{{ targets.theirs }}");
  },
  'click #pluralPeople': function() {
      insertAtCaret('pageAboutText',"{{ targets.count|pluralize:\"person,people\" }}");
  },
  'click #pluralS': function() {
      insertAtCaret('pageAboutText',"{{ targets.s }}");
  },
  'click #pluralAre': function() {
      insertAtCaret('pageAboutText',"{% requires\\_value targets.are %}{{ targets.are }}");
  },
  'click #pluralArent': function() {
      insertAtCaret('pageAboutText',"{% requires\\_value targets.arent %}{{ targets.arent }}");
  },
  'click #pluralHave': function() {
      insertAtCaret('pageAboutText',"{% requires\\_value targets.have %}{{ targets.have }}");
  },
  'click #pluralHavent': function() {
      insertAtCaret('pageAboutText',"{% requires\\_value targets.havent %}{{ targets.havent }}");
  },
  'click #pluralDo': function() {
      insertAtCaret('pageAboutText',"{% requires\\_value targets.do %}{{ targets.do }}");
  },
  'click #pluralDont': function() {
      insertAtCaret('pageAboutText',"{% requires\\_value targets.dont %}{{ targets.dont }}");
  },
  'click #pluralWere': function() {
      insertAtCaret('pageAboutText',"{% requires\\_value targets.were %}{{ targets.were }}");
  },
  'click #pluralWerent': function() {
      insertAtCaret('pageAboutText',"{% requires\\_value targets.werent %}{{ targets.werent }}");
  },
  'click #donationsHPC': function() {
      insertAtCaret('pageAboutText',"{% requires\\_value donations.highest\\_previous %}${{ donations.highest\\_previous }}");
  },
  'click #donationsAverage': function() {
      insertAtCaret('pageAboutText',"{% requires\\_value donations.average %}${{ donations.average }}");
  },
  'click #donationsMostRecent': function() {
      insertAtCaret('pageAboutText',"{% requires\\_value donations.most\\_recent %}${{ donations.most\\_recent }}");
  },
  'click #donationsMostRecentDate': function() {
      insertAtCaret('pageAboutText',"{% requires\\_value donations.most\\_recent\\_date %}${{ donations.most\\_recent\\_date }}");
  },
  'click #donationsYTD': function() {
      insertAtCaret('pageAboutText',"{% requires\\_value donations.year\\_to\\_date %}${{ donations.year\\_to\\_date }}");
  },
  'click #insertLink': function() {
      var url = 'http://act.credoaction.com/sign/' + Session.get('pageName').replace(/_/g,'\\_');
      insertAtCaret('pageAboutText','[link](' + url + ')');
  }
}); 

insertAtCaret = function(areaId,text) {
    var txtarea = document.getElementById(areaId);
    var scrollPos = txtarea.scrollTop;
    var strPos = 0;
    var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ? 
      "ff" : (document.selection ? "ie" : false ) );
    if (br == "ie") { 
      txtarea.focus();
      var range = document.selection.createRange();
      range.moveStart ('character', -txtarea.value.length);
      strPos = range.text.length;
    }
    else if (br == "ff") strPos = txtarea.selectionStart;

    var front = (txtarea.value).substring(0,strPos);  
    var back = (txtarea.value).substring(strPos,txtarea.value.length); 
    var str=front+text+back;
    txtarea.value=str;
    Session.set("markdown_data",str);
    strPos = strPos + text.length;
    if (br == "ie") { 
      txtarea.focus();
      var range = document.selection.createRange();
      range.moveStart ('character', -txtarea.value.length);
      range.moveStart ('character', strPos);
      range.moveEnd ('character', 0);
      range.select();
    }
    else if (br == "ff") {
      txtarea.selectionStart = strPos;
      txtarea.selectionEnd = strPos;
      txtarea.focus();
    }
    txtarea.scrollTop = scrollPos;
}

Template.postAPIpage.events({
  'click #buttonBackToPageList': function() {
    Router.go('pages');    
  },
  'click #buttonMakeEmail': function() {
    Router.go('compose', {}, {query: {page: Session.get("id")}});
  }
});

Template.templatePageTitle.events({
  'blur input[type=text]': function() {
    Session.set("pageTitle", $('#pageTitle').val());
  }
});

Template.templatePageName.events({
  'blur input[type=text]': function() {
    Session.set("pageName", $('#pageName').val());
  }
});

Template.templatePageStatement.events({
  'blur input': function() {
    Session.set("pageStatementLeadIn", $('#pageStatementLeadIn').val());
 },
  'blur textarea': function() {
    Session.set("pageStatementText", $('#pageStatementText').val());
  }
});

Template.templatePageAboutText.events({
  'blur textarea': function() {
    Session.set("pageAboutText", $('#pageAboutText').val());
  }
});

Template.templatePageFacebook.events({
  'blur input[type=text]': function() {
    Session.set("pageFacebookTitle", $('#pageFacebookTitle').val());
  },
  'blur textarea': function() {
    Session.set("pageFacebookCopy", $('#pageFacebookCopy').val());
    Session.set("pageFacebookLength", 260 - $('#pageFacebookCopy').val().length)
  }
});

Template.templatePageTwitterCopy.events({
  'blur textarea': function() {
    Session.set("pageTwitterCopy", $('#pageTwitterCopy').val());
    // assume 15 chars for bitly link, but if {LINK} exists then only need 9 more spaces
    var linkLength = $('#pageTwitterCopy').val().search(/{ *LINK *}/i) < 0 ? 23 : 16;
    Session.set("pageTwitterLength", 140 - linkLength - $('#pageTwitterCopy').val().length)
  }
});

Template.templatePageTAF.events({
  'blur input[type=text]': function() {
    Session.set("pageTAFSL", $('#pageTAFSL').val());
  },
  'blur textarea': function() {
    Session.set("pageTAFCopy", $('#pageTAFCopy').val());
  }
});

Template.templatePageConfEmail.events({
  'blur input[type=text]': function() {
    Session.set("pageConfEmailSL", $('#pageConfEmailSL').val());
    Session.set("pageConfEmailBody", $('#pageConfEmailBody').val());
},
  'blur textarea': function() {
    Session.set("pageConfEmailBody", $('#pageConfEmailBody').val());
  }
});

Template.templatePageGraphics.events({
  'blur #pageGraphicEmail': function() {
    Session.set("pageGraphicEmail", $('#pageGraphicEmail').val());
  },
  'blur #pageGraphicFacebook': function() {
    Session.set("pageGraphicFacebook", $('#pageGraphicFacebook').val());
  },
  'blur #pageGraphicHomePage': function() {
    Session.set("pageGraphicHomePage", $('#pageGraphicHomePage').val());
  }
});

Template.templatePageTags.events({
  'blur input[type=checkbox]': function() {
    var checked =  $(":checkbox:checked").map(function() {
        return this.value;
    }).get();
    Session.set("pageTags", checked);
  }
});

Template.createPageDisplay.importData = function() {
	return Session.set("pageImportAboutText", Template.pageCreationDisplay());
};

Template.pages.helpers({
  fileList: function() {
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
  },

  filterButtonText: function() {
    if (Session.equals("filter","all")) {
      return "show my pages";
    } else {
      return "show all";
    }
  }
});

Template.pages.events({
  // go to restore files page -- only for admins
  'click #restoreLink': function(evt) {
    evt.preventDefault();
    Router.go('restore');
  },
  // create petition page
  'click #templateChooser_petition': function(evt) {
    evt.preventDefault();
    Router.go('createPage', 
                {}, 
                {query: {template: 'petition'}}
              );
  },
  // create letter page
  'click #templateChooser_letter': function(evt) {
    evt.preventDefault();
    Router.go('createPage', 
                {}, 
                {query: {template: 'letter'}}
              );
  },
  // create event page
  'click #templateChooser_event': function(evt) {
    evt.preventDefault();
    Router.go('createPage', 
                {}, 
                {query: {template: 'event'}}
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
    Router.go('createPage', {}, {query: {copy: this._id}});
  },
  'click .deleteButton': function() { 
    Session.set("confirmDelete", this._id);
  },
  'click .apiButton': function() {
    Router.go('postAPI', {_id: this._id});
  },
  'click .emailButton': function() {
    Router.go('compose', {}, {query: {page: this._id}});
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
  'click .createSubEventButton': function() {
    Router.go('createSubEvents', {_id: this._id});    
  }
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


var tagDictionary = {
  'women': '/rest/v1/tag/1/',
  'choice': '/rest/v1/tag/2/',
  'environment': '/rest/v1/tag/3/',
  'fracking': '/rest/v1/tag/4/',
  'economic': '/rest/v1/tag/5/',
  'accountability': '/rest/v1/tag/6/',
  'coal': '/rest/v1/tag/7/',
  'food': '/rest/v1/tag/8/',
  'guns': '/rest/v1/tag/9/',
  'health': '/rest/v1/tag/10/',
  'voting': '/rest/v1/tag/11/',
  'Jin': '/rest/v1/tag/12/',
  'trade': '/rest/v1/tag/13/',
  'immigration': '/rest/v1/tag/14/',
  'labor': '/rest/v1/tag/15/',
  'homepage': '/rest/v1/tag/16/',
  'kicker': '/rest/v1/tag/17/',
  'chaser': '/rest/v1/tag/18/',
  'test': '/rest/v1/tag/19/',
  'local': '/rest/v1/tag/20/',
  'national': '/rest/v1/tag/21/',
  'organize': '/rest/v1/tag/22/',
  'petition': '/rest/v1/tag/23/',
  'call': '/rest/v1/tag/24/',
  'public_comment': '/rest/v1/tag/25/',
  'event': '/rest/v1/tag/26/',
  'fundraiser': '/rest/v1/tag/27/',
  'paid': '/rest/v1/tag/28/',
  'core': '/rest/v1/tag/29/',
  'lgbt': '/rest/v1/tag/30/',
  'reactivation': '/rest/v1/tag/31/',
  'credo': '/rest/v1/tag/32/',
  'dailykos': '/rest/v1/tag/33/',
  'allenwest': '/rest/v1/tag/34/',
  'superpac': '/rest/v1/tag/35/',
  'afghanistan': '/rest/v1/tag/36/',
  'bachmann': '/rest/v1/tag/37/',
  'baddems': '/rest/v1/tag/38/',
  'blackwater': '/rest/v1/tag/39/',
  'budget': '/rest/v1/tag/40/',
  'chamber': '/rest/v1/tag/41/',
  'citizensunited': '/rest/v1/tag/42/',
  'civilrights': '/rest/v1/tag/43/',
  'clarencethomas': '/rest/v1/tag/44/',
  'cleanairact': '/rest/v1/tag/45/',
  'climate': '/rest/v1/tag/46/',
  'corporations': '/rest/v1/tag/47/',
  'deathpenalty': '/rest/v1/tag/48/',
  'debtceiling': '/rest/v1/tag/49/',
  'drilling': '/rest/v1/tag/50/',
  'education': '/rest/v1/tag/51/',
  'filibuster': '/rest/v1/tag/52/',
  'financial': '/rest/v1/tag/53/',
  'fox': '/rest/v1/tag/54/',
  'healthcare': '/rest/v1/tag/55/',
  'judges': '/rest/v1/tag/56/',
  'marriage': '/rest/v1/tag/57/',
  'media': '/rest/v1/tag/58/',
  'medicare': '/rest/v1/tag/59/',
  'netneutrality': '/rest/v1/tag/60/',
  'nuclear': '/rest/v1/tag/61/',
  'palin': '/rest/v1/tag/62/',
  'peace': '/rest/v1/tag/63/',
  'pollution': '/rest/v1/tag/64/',
  'publicbroadcasting': '/rest/v1/tag/65/',
  'race': '/rest/v1/tag/66/',
  'rhetoric': '/rest/v1/tag/67/',
  'senatereform': '/rest/v1/tag/68/',
  'socialsecurity': '/rest/v1/tag/69/',
  'tarsands': '/rest/v1/tag/70/',
  'taxes': '/rest/v1/tag/71/',
  'torture': '/rest/v1/tag/72/',
  'war': '/rest/v1/tag/73/',
  'wiretapping': '/rest/v1/tag/74/',
  'gmo': '/rest/v1/tag/75/',
  'finance': '/rest/v1/tag/76/',
  'progressivesunited': '/rest/v1/tag/77/',
  'demsdotcom': '/rest/v1/tag/78/',
  'colorofchange': '/rest/v1/tag/79/',
  'wind': '/rest/v1/tag/80/',
  'hlinko': '/rest/v1/tag/81/',
  'Iran': '/rest/v1/tag/82/',
  'solar': '/rest/v1/tag/83/',
  'rebuildthedream': '/rest/v1/tag/84/',
  'renewables': '/rest/v1/tag/85/',
  'risingtide': '/rest/v1/tag/86/',
  'drones': '/rest/v1/tag/87/',
  'fan': '/rest/v1/tag/88/',
  'toxic': '/rest/v1/tag/89/',
  'bees': '/rest/v1/tag/90/',
  'presente': '/rest/v1/tag/91/',
  'international': '/rest/v1/tag/92/',
  'mining': '/rest/v1/tag/93/',
  'welcome_email': '/rest/v1/tag/94/',
  'sweep': '/rest/v1/tag/95/',
  'launch': '/rest/v1/tag/96/',
  'rollout': '/rest/v1/tag/97/',
  'dontuse': '/rest/v1/tag/98/',
  'specialprojects': '/rest/v1/tag/99/',
  'actblue': '/rest/v1/tag/100/',
  'rootsaction': '/rest/v1/tag/101/',
  'drugs': '/rest/v1/tag/102/',
  'privatization': '/rest/v1/tag/103/',
  'seniors': '/rest/v1/tag/104/',
  'animals': '/rest/v1/tag/105/',
  'grassroots': '/rest/v1/tag/106/',
  'waunited': '/rest/v1/tag/107/',
  'changedotorg_signers': '/rest/v1/tag/108/',
  'elizabethwarren': '/rest/v1/tag/109/',
  'demandprogress': '/rest/v1/tag/110/',
  'PlannedParenthood': '/rest/v1/tag/128/',
  'reginaschwartz': '/rest/v1/tag/129/',
  'neworganizing': '/rest/v1/tag/130/',
  'netrootsnation': '/rest/v1/tag/131/',
  'pccc': '/rest/v1/tag/132/',
  'sierraclub': '/rest/v1/tag/133/',
  'arctic': '/rest/v1/tag/134/',
  'usaction': '/rest/v1/tag/135/',
  'sumofus': '/rest/v1/tag/136/',
  'tp10': '/rest/v1/tag/137/',
  'motherjones': '/rest/v1/tag/138/',
  'votevets': '/rest/v1/tag/139/',
  'mortgage': '/rest/v1/tag/140/',
  'steveking': '/rest/v1/tag/141/',
  'ewg': '/rest/v1/tag/142/',
  'conservation': '/rest/v1/tag/143/',
  'studentloans': '/rest/v1/tag/144/',
  'joewalsh': '/rest/v1/tag/145/',
  'control': '/rest/v1/tag/146/',
  'treatment': '/rest/v1/tag/147/',
  'chamberofcommerce': '/rest/v1/tag/148/',
  'non_action_page': '/rest/v1/tag/149/',
  'no_akid_mailing': '/rest/v1/tag/150/',
  'taxcannibus': '/rest/v1/tag/151/',
  'elections': '/rest/v1/tag/152/',
  'saveourenvironment': '/rest/v1/tag/153/',
  'eff': '/rest/v1/tag/154/',
  'occupy': '/rest/v1/tag/155/',
  'donors': '/rest/v1/tag/156/',
  'denner': '/rest/v1/tag/157/',
  'upworthy_email': '/rest/v1/tag/158/',
  'kamalaharris': '/rest/v1/tag/159/',
  'emilyslist': '/rest/v1/tag/160/',
  'other98': '/rest/v1/tag/161/',
  'patriotact': '/rest/v1/tag/162/',
  'ssworks': '/rest/v1/tag/163/',
  'boehner': '/rest/v1/tag/164/',
  'ericcantor': '/rest/v1/tag/165/',
  'monsanto': '/rest/v1/tag/166/',
  'fdn': '/rest/v1/tag/167/',
  'rickperry': '/rest/v1/tag/168/',
  'doublehit': '/rest/v1/tag/169/',
  'upworthy_holler': '/rest/v1/tag/170/',
  'uganda': '/rest/v1/tag/171/',
  'lcv': '/rest/v1/tag/172/',
  'outsourcing': '/rest/v1/tag/173/',
  'freespeech': '/rest/v1/tag/174/',
  'bullying': '/rest/v1/tag/175/',
  'doma': '/rest/v1/tag/176/',
  'burma': '/rest/v1/tag/177/',
  'dfa': '/rest/v1/tag/178/',
  'clcv': '/rest/v1/tag/179/',
  'defenders': '/rest/v1/tag/180/',
  'dadt': '/rest/v1/tag/181/',
  'greenpeace': '/rest/v1/tag/182/',
  'medicaid': '/rest/v1/tag/183/',
  'texas': '/rest/v1/tag/184/',
  'water': '/rest/v1/tag/185/',
  'deficit': '/rest/v1/tag/186/',
  'defense': '/rest/v1/tag/187/',
  'spending': '/rest/v1/tag/188/',
  'bushtaxcuts': '/rest/v1/tag/189/',
  'cleanair': '/rest/v1/tag/190/',
  'wilderness': '/rest/v1/tag/191/',
  'truemajority': '/rest/v1/tag/192/',
  'iowa': '/rest/v1/tag/193/',
  'wisconsin': '/rest/v1/tag/194/',
  'thankyou': '/rest/v1/tag/195/',
  'nelson': '/rest/v1/tag/196/',
  'senate': '/rest/v1/tag/197/',
  'att': '/rest/v1/tag/198/',
  'breitbart': '/rest/v1/tag/199/',
  'earthjustice': '/rest/v1/tag/200/',
  'stumbledupon': '/rest/v1/tag/201/',
  'glennbeck': '/rest/v1/tag/202/',
  'maryland': '/rest/v1/tag/203/',
  'obama': '/rest/v1/tag/204/',
  'rightwing': '/rest/v1/tag/205/',
  'ccd': '/rest/v1/tag/206/',
  'piven': '/rest/v1/tag/207/',
  'oreilly': '/rest/v1/tag/208/',
  'rawstory': '/rest/v1/tag/209/',
  'chongandkoster': '/rest/v1/tag/210/',
  'nationalmemo': '/rest/v1/tag/211/',
  'Causes': '/rest/v1/tag/212/',
  'environmental action': '/rest/v1/tag/213/',
  'ran': '/rest/v1/tag/214/',
  'fcc': '/rest/v1/tag/215/',
  'copps': '/rest/v1/tag/216/',
  'jerrybrown': '/rest/v1/tag/217/',
  'methyliodide': '/rest/v1/tag/218/',
  'delay': '/rest/v1/tag/219/',
  'disclose': '/rest/v1/tag/220/',
  'iraq': '/rest/v1/tag/221/',
  'bush': '/rest/v1/tag/222/',
  'salmon': '/rest/v1/tag/223/',
  'labeling': '/rest/v1/tag/224/',
  'judicial': '/rest/v1/tag/225/',
  'voterregistrationact': '/rest/v1/tag/226/',
  'irs': '/rest/v1/tag/227/',
  'ckads': '/rest/v1/tag/228/',
  'upworthy': '/rest/v1/tag/229/',
  'mailing 8622 target': '/rest/v1/tag/230/',
  'actblue_expresslane': '/rest/v1/tag/231/',
  'walmart': '/rest/v1/tag/232/',
  'mixed channel': '/rest/v1/tag/233/',
  'kxl_action_event_host': '/rest/v1/tag/236/',
  'civil liberties': '/rest/v1/tag/237/',
  'ControlShift Category: education': '/rest/v1/tag/238/',
  'oil change international': '/rest/v1/tag/239/',
  'testing_universe': '/rest/v1/tag/240/',
  'deliveries - closed': '/rest/v1/tag/241/',
  'delivery': '/rest/v1/tag/242/',
  'friends_of_the_earth': '/rest/v1/tag/243/',
  'partnership': '/rest/v1/tag/244/',
  'copied for delivery': '/rest/v1/tag/245/',
  'nycc': '/rest/v1/tag/246/',
  'momsdemandaction': '/rest/v1/tag/247/',
  'rhrealitycheck': '/rest/v1/tag/248/',
  'socialsecurityworks': '/rest/v1/tag/249/',
  'takeactionmn': '/rest/v1/tag/250/',
  'boldnebraska': '/rest/v1/tag/251/',
  '350': '/rest/v1/tag/252/',
  'fossilfree': '/rest/v1/tag/253/',
  'MissouriansOrganizingforReformandEmpowerment': '/rest/v1/tag/254/',
  'foodandwaterwatch': '/rest/v1/tag/255/',
  'turtleisland': '/rest/v1/tag/256/',
  'ethicalelectric': '/rest/v1/tag/257/',
  'CenterforCommunityChange': '/rest/v1/tag/258/',
  'berim': '/rest/v1/tag/259/',
  'ALEC': '/rest/v1/tag/260/',
  'medicaid expansion': '/rest/v1/tag/261/',
  'medicaid_expansion': '/rest/v1/tag/262/',
  'minimumwage': '/rest/v1/tag/263/',
  'action network': '/rest/v1/tag/264/',
  'Globalization': '/rest/v1/tag/265/',
  'affiliate': '/rest/v1/tag/266/',
  'day we fight back': '/rest/v1/tag/267/',
  'KansasPeoplesAction': '/rest/v1/tag/268/',
  'mobilize_calls': '/rest/v1/tag/269/',
  'alan grayson': '/rest/v1/tag/270/',
  'scalia': '/rest/v1/tag/271/',
  'Outbrain': '/rest/v1/tag/278/',
  'Taboola': '/rest/v1/tag/279/',
  'reset the net': '/rest/v1/tag/280/',
  'McConnell': '/rest/v1/tag/281/',
  'Gardner': '/rest/v1/tag/282/',
  'AFT': '/rest/v1/tag/283/',
  'Open media': '/rest/v1/tag/284/',
  'donations voters': '/rest/v1/tag/285/',
  'Yes on 92': '/rest/v1/tag/286/',
  'Mobile fundraiser': '/rest/v1/tag/287/',
  'reactivation match': '/rest/v1/tag/288/',
  'credo customer': '/rest/v1/tag/289/',
  'Big Telecom': '/rest/v1/tag/290/',
  'couragecampaign': '/rest/v1/tag/291/'
};