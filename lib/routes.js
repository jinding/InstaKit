// Define our routes
Router.route('/', {
  name: 'home',
  template: 'pages',
  path: '/',
  action: function() {
    this.render();
  }
});

Router.route('mailings', {
  name: 'mailings',
  path: '/mailings/',
  template: 'filePage',
  onBeforeAction: function() {
    Session.set('emailNotSaved',false);
    this.next();
  },
  action: function() {
    this.render();
  }
});

Router.route('compose', {
  // compose route with an optional ID parameter
  name: 'compose',
  path: '/mailings/compose/:_id?',
  template: 'composePage',
  onBeforeAction: function () {
    if (this.params._id) {
      // edit an existing email
      Session.set("newEmail", false);
      var email = Files.findOne(this.params._id);
      setSessionVarsForEmail(email);
    } else if (this.params.query.copy) {
      // create a new email by copying another email
      console.log("copying mailing " + this.params.query.copy);
      var email = Files.findOne(this.params.query.copy);
      setSessionVarsForEmail(email); // copy email vars from selected email
      Session.set("newEmail", true); // but this is a new email, not a current email
      // clear creator and ID vars because this is a new email
      Session.set("creator", "");
      Session.set("id", "");
    } else if (this.params.query.page) {
      // create an email from a saved page
      var page = Files.findOne(this.params.query.page);
      setSessionVarsForEmailFromPage(page);
      Session.set("newEmail", true);
      Session.set("creator","");
      Session.set("id","");
    } else {
      // create a new email
      Session.set("newEmail", true);
      Session.set("creator","");
      Session.set("id","");
      // default to petition email if no query parameter for template set
      Session.set('templateChooser',this.params.query.template || 'petition');
      setSessionVarsForNewEmail();
    } 
    initSessionVarsForCompose();
    this.next();
  },
  action: function() {
    this.render();
  }
});

Router.route('pages', {
  name: 'pages',
  path: '/pages/',
  template: 'pages',
  action: function() {
    this.render();
  }
});

Router.route('createPage', {
  name: 'createPage',
  path: '/pages/compose/:_id?',
  template: 'createPage',
  onBeforeAction: function () {
    if (this.params._id) {
      Session.set("newPage", false);
      Session.set('subEventCreatedMsg', "");

      var page = Files.findOne(this.params._id);
      // check for missing page and throw a 404
      setSessionVarsForPage(page);
    } else if (this.params.copy) {
      var page = Files.findOne(this.params.copy);
     // check for missing email and throw a 404
      setSessionVarsForPage(page); // copy page vars from selected page
      Session.set("newPage", true); // but this is a new page, not a current page
      // clear creator and ID vars, as well as created page vars because this is a new page
      Session.set("creator", "");
      Session.set("id", "");
      Session.set('AKpageURL', "");
      Session.set('AKpageEditURL', "");
      Session.set('AKpageBitly', "");
      Session.set('pageSharePageLink', "");
      Session.set('AKpageID',"");
      Session.set('AKpageResourceURI', "");
      Session.set("eventUmbrellaCampaignURL", "");
      Session.set("eventUmbrellaHostURL", "");
      Session.set("eventUmbrellaSignupPageURL", "");
      Session.set('subEventCreatedMsg', "");
    } else {
      Session.set("newPage", true);
      Session.set("creator", "");
      Session.set("id", "");
      // default to petition page type if no query parameter for template set
      Session.set('templateChooser', this.params.query.template || 'petition');
      console.log(this.params.query.template);
      setSessionVarsForNewPage();
      if (this.params.query.template == 'event') { setSessionVarsForNewEvent(); }
    } 
    initSessionVarsForPageCompose();
    this.next();
  },
  action: function() {
    this.render();
  }
});

Router.route('restore', {
  name: 'restore',
  path: '/restore/',
  template: 'adminDeletedFilesPage',
  action: function() {
    this.render();
  }
});

Router.route('postAPI', {
  name: 'postAPI',
  path: '/pages/postAPI/:_id?',
  template: 'postAPIpage',
  onBeforeAction: function() {
    var page = Files.findOne(this.params._id);  
    setSessionVarsForPage(page);
    this.next();
  },
  action: function() {
    this.render();
  }
});

Router.route('createSubEvents', {
  name: 'createSubEvents',
  path: '/pages/createSubEvents/:_id?',
  template: 'createSubEvents',
  onBeforeAction: function() {
    var eventUmbrella = Files.findOne(this.params._id);
    setSessionVarsForPage(eventUmbrella);
    setSessionVarsForNewSubEvent(eventUmbrella);
    this.next();
  },
  action: function() {
    this.render();
  }
});

var requireLogin = function() {
  if (! Meteor.user()) {
    this.render('loginPage');
  } else {
    this.next();
  }
}

Router.onBeforeAction(requireLogin, { except: 'loginPage'});

/*
// this hook will run on almost all routes
Router.onBeforeAction( function (pause) {
  if (! Meteor.user()) {
    this.render('loginPage');
//    pause();
  } else {
    this.next();
  }
}, {
  except: ['login']
});
*/