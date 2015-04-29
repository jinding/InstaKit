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
  Session.set("pageConfEmailSender", $('#pageConfEmailSender').val());
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
    pageConfEmailSender: Session.get("pageConfEmailSender"),
    pageConfEmailBody: Session.get("pageConfEmailBody"),
    pageTags: Session.get("pageTags"),
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
  'keyup input, keyup textarea, keyup select': function() {
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
          Session.set('showLoading', false);
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
    Session.set('showLoading', true);
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
          Session.set('showLoading', false);
        } else {
          console.log('page saved');
          console.log('upsert id ' + res.insertedId);
          if (!Session.get('id')) { Session.set('id', res.insertedId); }
          Session.set("pageNotSaved",false);
          Session.set("saveDialog",false);        }
      });
      // edit created AK page
      Meteor.call('updateAKpage', page, function (error,res) {
        if (error) {
          Session.set('apiError', error.reason);
          Session.set('showLoading', false);
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
              Session.set('showLoading', false);
            } else {
              console.log('page saved');
              Session.set("pageNotSaved",false);
              Session.set("saveDialog",false);
            }
          });
          Session.set('showLoading', false);
          console.log('updateAKpage success',res);
        }
      }); // end updateAKpage
    } // end if share text is within length limits
  }, 
  'click #buttonAPI': function() {
    Session.set('showLoading', true);
    Session.set("apiError","");
    var page = makePageFromSession();
    // only move forward if the share text doesn't exceed length limits
    if (Session.get('pageTwitterLength') < 0 || Session.get('pageFacebookLength') < 0) {
      Session.set('apiError', 'Share text is too long. Please check Facebook and Twitter copy again.');
    } else {
      Meteor.call('saveFile', page, function (err, res) {
        if (err) {
          Session.set('saveError', err.error);
          Session.set('showLoading', false);
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
          Session.set('showLoading', false);
          console.log(err.reason);
        } else {
          console.log('create page success '+loc);
          Meteor.call('populateAKpage', page, loc, function (error,res) {
            if (error) {
                Session.set('apiError', error.reason);
                Session.set('showLoading', false);
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
                    Session.set('showLoading', false);
                  } else {
                    console.log('page saved');
                    Session.set("pageNotSaved",false);
                    Session.set("saveDialog",false);
                  }
                });
                Session.set('showLoading', false);
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
