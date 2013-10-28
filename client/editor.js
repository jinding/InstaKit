Meteor.startup(function () {
  Session.set("emailNotSaved",false);
});

Meteor.subscribe('files');

Handlebars.registerHelper("wrapperStyle", function(str) {
  return Session.equals('templateChooser', str) ? "true" : "";
});

Handlebars.registerHelper("display_setting", function(selection) {
  return Session.equals("display",selection);
});

Handlebars.registerHelper("django_string", function(str) {
  return str; // get django strings to display as text
});

Handlebars.registerHelper("getValue", function(value) {
  return Session.get(value);
});

Handlebars.registerHelper("sigFirstName", function() {
  return Session.get("signature").split(' ')[0];
});

Handlebars.registerHelper("show_html", function() {
  var converter = new Showdown.converter();
  return converter.makeHtml(Session.get("markdown_data"));
});

Handlebars.registerHelper("prettifyDate", function(d) {
  if (d) {
    var a_p = "";
    var curr_hour = d.getHours();
    var curr_min = d.getMinutes();
    var pad = function (x) {
      return (x < 10 ? '0' : '') + x;
    };

    if (curr_hour < 12) { a_p = "AM";}
      else { a_p = "PM"; }
    if (curr_hour == 0) { curr_hour = 12; }
    if (curr_hour > 12) { curr_hour = curr_hour - 12; }

    var str = [d.getMonth()+1,d.getDate(),d.getFullYear()-2000].join('/') +
      " " + curr_hour + ":" + pad(curr_min) + " " + a_p;
    return str;
  } else { return ''; }
});

// router

function setSessionVarsForEmail(obj) {
  Session.set("id", obj._id);
  Session.set("markdown_data", obj.markdown_data);
  Session.set("templateChooser", obj.type);
  Session.set("topper", obj.topper);
  Session.set("headline", obj.headline);
  Session.set("statement_leadin", obj.statement_leadin);
  Session.set("petition", obj.petition);
  Session.set("link", obj.link);
  Session.set("graphic", obj.graphic);
  Session.set("graphic_alt_text", obj.graphic_alt_text);
  Session.set("signature", obj.signature);
  Session.set("footnotes", obj.footnotes);
  Session.set("facebook", obj.facebook);
  Session.set("twitter", obj.twitter);
  Session.set("creator", obj.creator);
  Session.set("when", obj.when);
}

function setSessionVarsForNewEmail() {
  // template type is set in the link event handler so not necessary here
  // clear the other email session data
  Session.set("markdown_data", "");
  Session.set("topper", "");
  Session.set("headline", "");
  Session.set("statement_leadin", "");
  Session.set("petition", "");
  Session.set("link", "");
  Session.set("graphic", "");
  Session.set("graphic_alt_text", "");
  Session.set("signature", "");
  Session.set("footnotes", "");
  Session.set("facebook", "");
  Session.set("twitter", "");
  Session.set("creator", "");
}

function initSessionVarsForCompose() {
  Session.set("display", "visual");
  Session.set("showNavBar",false);
  Session.set("snippets",false);
  Session.set("toolTips",false);
  Session.set("emailNotSaved",false);
  Session.set("saveDialog",false);
}

Router.map(function () {
  this.route('home', {
    path: '/',
    template: 'filePage',
    action: Session.set('emailNotSaved',false)
  });

  this.route('compose', {
    // compose route with an optional ID parameter
    path: '/compose/:_id?',
    template: 'composePage',
    before: function () {
      if (this.params._id) {
        Session.set("newEmail", false);
        var email = Files.findOne(this.params._id);
        // check for missing email and throw a 404
        setSessionVarsForEmail(email);
      } else if (this.params.copy) {
        var email = Files.findOne(this.params.copy);
        // check for missing email and throw a 404
        setSessionVarsForEmail(email); // copy email vars from selected email
        Session.set("newEmail", true); // but this is a new email, not a current email
        // clear creator and ID vars because this is a new email
        Session.set("creator", "");
        Session.set("id", "");
      } else {
        Session.set("newEmail", true);
        // default to petition email if no query parameter for template set
        Session.set('templateChooser',this.params.template || 'petition');
        setSessionVarsForNewEmail();
      } 
      initSessionVarsForCompose();
    }
  });
});

// this hook will run on almost all routes
Router.before(function () {
  if (! Meteor.user()) {
    this.render('loginPage');
    this.stop();
  }
}, {except: ['login']});


window.onbeforeunload = function closeIt() {
  return Session.get("emailNotSaved") ?  "This email hasn't been saved." : null;
};



