Meteor.startup(function () {
//  Session.set("showComposePage",false);
//  Session.set("newEmail",false);
//  Session.set("filter","all");
//  Session.set("sortSavedAt","desc");
//  Session.set("sortHeadline","");
//  Session.set("sortType",""); 
//  Session.set("sortCreatedBy","");
//  Session.set("sortSavedBy","");
  Session.set("toolTips",false);
  Session.set("saveDialog",false);
//  Session.set("display","visual");
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

window.onbeforeunload = function closeIt() {
  return Session.get("showComposePage") ? "This email hasn't been saved." : null;
};  


