Template.composePage.buttonText = function() {
  return Session.equals("display", "visual") ? "HTML" : "visual";
};

Template.notes.events({
  'blur input[type=text]': function() {
    Session.set("notes", $('#notes_text').val());
  }
});

Template.headline.events({
  'blur input[type=text]': function() {
    Session.set("headline", $('#headline_text').val());
  }
});

Template.statement_leadin.events({
  'blur input[type=text]': function() {
    Session.set("statement_leadin", $('#statement_leadin_text').val());
  }
});

Template.petition.events({
  'blur textarea': function() {
    Session.set("petition", $('#petition_text').val());
  }
});

Template.link.events({
  'blur input[type=text]': function() {
    Session.set("link", $('#link_text').val());
  }
});

Template.graphic.events({
  'blur input[type=text]': function() {
    Session.set("graphic", $('#graphic_text').val());
  }
});

Template.graphic_alt.events({
  'blur input[type=text]': function() {
    Session.set("graphic_alt_text", $('#graphic_alt_text').val());
  }
});

Template.signature.events({
  'blur input[type=text]': function() {
    Session.set("signature", $('#signature_text').val());
  }
});

Template.footnotes.events({
  'blur textarea': function() {
    Session.set("footnotes", $('#footnotes_text').val());
  }
});

Template.twitter.events({
  'blur input[type=text]': function() {
    Session.set("twitter", urlEncodeQuotes($('#twitter_text').val()));
  }
});

Template.markdown_input.events({
  'blur textarea': function() {
    Session.set("markdown_data", $('#markdown_text').val());
  }
});

Template.topper.events({
  'blur textarea': function() {
    Session.set("topper", $('#topper_text').val());
  }
});

Template.facebook.events({
  'blur input[type=text]': function() {
    Session.set("facebook", $('#facebook_text').val());
  }
});

Template.refcode.events({
  'blur input[type=text]': function() {
    Session.set("refcode", $('#refcode').val());
  }
});

function removeCurlyQuotes(str) {
  var goodQuotes = str
  .replace(/[\u2018\u2019]/g, "'")
  .replace(/[\u201C\u201D]/g, '"');
  return goodQuotes;
};

function urlEncodeQuotes (str) {
  return str.replace(/['""]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
};

function makeEmailFromSession() {
  return {
    id: Session.get("id"),
    type: Session.get("templateChooser"),
    notes: Session.get("notes"),
    headline: Session.get("headline"),
    topper: Session.get("topper"),
    statement_leadin: Session.get("statement_leadin"),
    petition: Session.get("petition"),
    link: Session.get("link"),
    graphic: Session.get("graphic"),
    graphic_alt_text: Session.get("graphic_alt_text"),
    signature: Session.get("signature"),
    footnotes: Session.get("footnotes"),
    facebook: Session.get("facebook"),
    twitter: removeCurlyQuotes(Session.get("twitter")),
    markdown_data: Session.get("markdown_data"),
    refcode: Session.get("refcode"),
    creator: Session.get("creator") || Meteor.user().profile.name,
    savedBy: Meteor.user().profile.name
  }
};

Template.saveDialog.events({
  'click #cancelSave': function() {
      Session.set("saveDialog",false);
  },
  'click #yesSave': function() {
    Meteor.call('saveFile', makeEmailFromSession(), function (err, res) {
      if (err) {
        Session.set('saveError', err.error);
      } else {
        Session.set("emailNotSaved",false);
        Session.set("saveDialog",false);
        Router.go('mailings');
      }
    });
  }
});

Template.composePage.events({
  'keyup input[type=text], keyup textarea': function() {
    Session.set("emailNotSaved",true);
  },
  'click #display, click #display_html, click #composeRight': function() {
    Session.set("showNavBar",false);
    Session.set("snippets",false);
    Session.set("toolTips",false);
  },
  'click #display_html': function() {
    var range = document.createRange();
    range.selectNode(document.getElementById("display_html"));
    window.getSelection().addRange(range);  
  },
  'click #buttonSave': function(evt) {
    if (Session.get("newEmail")
        || Session.equals("creator", Meteor.user().profile.name)) {
      Meteor.call('saveFile', makeEmailFromSession(), function (err, res) {
        if (err) {
          Session.set('saveError', err.error);
        } else {
          Session.set("emailNotSaved",false);
          Router.go('mailings');
        }
      });
    } else {
      Session.set("saveDialog",true);
    }
  },
  'click #buttonBackToFilePage': function() {
    Router.go('mailings');
  },
  'click #buttonAPI': function() {
    Meteor.call('createAKemail', makeEmailFromSession(), function (err,res) {
     if (err) {
        Session.set('APIerror', err.error);
        console.log(err);
      } else {
        console.log('api success');
      }
    });
  }
});

Template.composePage.events({
  'click #buttonDisplay': function(evt) {
    if (Session.equals("display","visual")) {
      Session.set("display","html");
    } else {
      Session.set("display","visual");  
    }
    evt.preventDefault();
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
  'click #userCity': function() {
      insertAtCaret('markdown_text',"{{ user.city|default:\"your city\" }}");
  },
  'click #userStateAbbrev': function() {
      insertAtCaret('markdown_text',"{{ user.state|default:\"your state\" }}");
  },
  'click #userStateName': function() {
      insertAtCaret('markdown_text',"{{ user.state\\_name|default:\"your state\" }}");
  },
  'click #userZip': function() {
      insertAtCaret('markdown_text',"{{ user.zip }}");
  },
  'click #targetAbbrev': function() {
      insertAtCaret('markdown_text',"{% requires\\_value targets.title\\_last %}{{ targets.title\\_last }}");
  },
  'click #targetFullTitle': function() {
      insertAtCaret('markdown_text',"{% requires\\_value targets.title\\_full %}{{ targets.title\\_full }}");
  },
  'click #targetFullName': function() {
      insertAtCaret('markdown_text',"{% requires\\_value targets.full\\_name %}{{ targets.full\\_name }}");
  },
  'click #targetLastName': function() {
      insertAtCaret('markdown_text',"{% requires\\_value targets.last %}{{ targets.last }}");
  },
  'click #pluralThem': function() {
      insertAtCaret('markdown_text',"{% requires\\_value targets.count %}{{ targets.them }}");
  },
  'click #pluralThey': function() {
      insertAtCaret('markdown_text',"{% requires\\_value targets.they %}{{ targets.they }}");
  },
  'click #pluralTheir': function() {
      insertAtCaret('markdown_text',"{% requires\\_value targets.their %}{{ targets.their }}");
  },
  'click #pluralTheirs': function() {
      insertAtCaret('markdown_text',"{% requires\\_value targets.theirs %}{{ targets.theirs }}");
  },
  'click #pluralPeople': function() {
      insertAtCaret('markdown_text',"{{ targets.count|pluralize:\"person,people\" }}");
  },
  'click #pluralS': function() {
      insertAtCaret('markdown_text',"{{ targets.s }}");
  },
  'click #pluralAre': function() {
      insertAtCaret('markdown_text',"{% requires\\_value targets.are %}{{ targets.are }}");
  },
  'click #pluralArent': function() {
      insertAtCaret('markdown_text',"{% requires\\_value targets.arent %}{{ targets.arent }}");
  },
  'click #pluralHave': function() {
      insertAtCaret('markdown_text',"{% requires\\_value targets.have %}{{ targets.have }}");
  },
  'click #pluralHavent': function() {
      insertAtCaret('markdown_text',"{% requires\\_value targets.havent %}{{ targets.havent }}");
  },
  'click #pluralDo': function() {
      insertAtCaret('markdown_text',"{% requires\\_value targets.do %}{{ targets.do }}");
  },
  'click #pluralDont': function() {
      insertAtCaret('markdown_text',"{% requires\\_value targets.dont %}{{ targets.dont }}");
  },
  'click #pluralWere': function() {
      insertAtCaret('markdown_text',"{% requires\\_value targets.were %}{{ targets.were }}");
  },
  'click #pluralWerent': function() {
      insertAtCaret('markdown_text',"{% requires\\_value targets.werent %}{{ targets.werent }}");
  },
  'click #donationsHPC': function() {
      insertAtCaret('markdown_text',"{% requires\\_value donations.highest\\_previous %}${{ donations.highest\\_previous }}");
  },
  'click #donationsAverage': function() {
      insertAtCaret('markdown_text',"{% requires\\_value donations.average %}${{ donations.average }}");
  },
  'click #donationsMostRecent': function() {
      insertAtCaret('markdown_text',"{% requires\\_value donations.most\\_recent %}${{ donations.most\\_recent }}");
  },
  'click #donationsMostRecentDate': function() {
      insertAtCaret('markdown_text',"{% requires\\_value donations.most\\_recent\\_date %}${{ donations.most\\_recent\\_date }}");
  },
  'click #donationsYTD': function() {
      insertAtCaret('markdown_text',"{% requires\\_value donations.year\\_to\\_date %}${{ donations.year\\_to\\_date }}");
  },
  'click #insertLink': function() {
      insertAtCaret('markdown_text','[link](' + Session.get('link').replace(/_/g,'\\_') + ')');
  },
  'click #superpacAskBlock': function() {
      var askBlock = '<table width=\"80%\" align=\"center\" style=\"background-color: #ECEDF0; text-align: center; margin:0 auto;\">\n\
<tr><td style=\"text-align:center;padding:0px 10px;\">\n\n\
  <p><center><em>If you\'ve saved your payment information with ActBlue Express, your donation will go through immediately:</em></center></p>\n\n\
{% if donations.highest\_previous %} {% if donations.highest\_previous < 30 %}\n\n\
  <p><center><strong><a href=\"https://secure.actblue.com/contribute/page/savethesenate?express_lane=true&amount=5&refcode=ie_actblue_campaignRefCode_d_express5\">Express Donate: $5</a></strong></center></p>\n\
  <p><center><strong><a href=\"https://secure.actblue.com/contribute/page/savethesenate?express_lane=true&amount=15&refcode=ie_actblue_campaignRefCode_d_express15\">Express Donate: $15</a></strong></center></p>\n\
  <p><center><strong><a href=\"https://secure.actblue.com/contribute/page/savethesenate?express_lane=true&amount=50&refcode=ie_actblue_campaignRefCode_d_express50\">Express Donate: $50</a></strong></center></p>\n\
  <p><center><strong><a href=\"https://secure.actblue.com/contribute/page/savethesenate?express_lane=true&amount=100&refcode=ie_actblue_campaignRefCode_d_express100\">Express Donate: $100</a></strong></center></p>\n\n\
{% else %} {% if donations.highest_previous < 100 %}\n\n\
  <p><center><strong><a href=\"https://secure.actblue.com/contribute/page/savethesenate?express_lane=true&amount=15&refcode=ie_actblue_campaignRefCode_d_express15\">Express Donate: $15</a></strong></center></p>\n\
  <p><center><strong><a href=\"https://secure.actblue.com/contribute/page/savethesenate?express_lane=true&amount=50&refcode=ie_actblue_campaignRefCode_d_express50\">Express Donate: $50</a></strong></center></p>\n\
  <p><center><strong><a href=\"https://secure.actblue.com/contribute/page/savethesenate?express_lane=true&amount=100&refcode=ie_actblue_campaignRefCode_d_express100\">Express Donate: $100</a></strong></center></p>\n\
  <p><center><strong><a href=\"https://secure.actblue.com/contribute/page/savethesenate?express_lane=true&amount=250&refcode=ie_actblue_campaignRefCode_d_express250\">Express Donate: $250</a></strong></center></p>\n\n\
{% else %}\n\n\
  <p><center><strong><a href=\"https://secure.actblue.com/contribute/page/savethesenate?express_lane=true&amount=50&refcode=ie_actblue_campaignRefCode_d_express50\">Express Donate: $50</a></strong></center></p>\n\
  <p><center><strong><a href=\"https://secure.actblue.com/contribute/page/savethesenate?express_lane=true&amount=100&refcode=ie_actblue_campaignRefCode_d_express100\">Express Donate: $100</a></strong></center></p>\n\
  <p><center><strong><a href=\"https://secure.actblue.com/contribute/page/savethesenate?express_lane=true&amount=250&refcode=ie_actblue_campaignRefCode_d_express250\">Express Donate: $250</a></strong></center></p>\n\
  <p><center><strong><a href=\"https://secure.actblue.com/contribute/page/savethesenate?express_lane=true&amount=500&refcode=ie_actblue_campaignRefCode_d_express500\">Express Donate: $500</a></strong></center></p>\n\n\
{% endif %} {% endif %}\n\n\
  <p><center><strong><a href=\"https://secure.actblue.com/contribute/page/savethesenate?refcode=ie_actblue_campaignRefCode_d_express_other\">Or donate another amount.</a></strong></center></p>\n\n\
{% else %}\n\n\
<p><center><strong><a href=\"https://secure.actblue.com/contribute/page/savethesenate?express_lane=true&amount=3&refcode=ie_actblue_campaignRefCode_a_express3\">Express Donate: $3</a></strong></center></p>\n\
<p><center><strong><a href=\"https://secure.actblue.com/contribute/page/savethesenate?express_lane=true&amount=15&refcode=ie_actblue_campaignRefCode_a_express15\">Express Donate: $15</a></strong></center></p>\n\
<p><center><strong><a href=\"https://secure.actblue.com/contribute/page/savethesenate?express_lane=true&amount=50&refcode=ie_actblue_campaignRefCode_a_express50\">Express Donate: $50</a></strong></center></p>\n\
<p><center><strong><a href=\"https://secure.actblue.com/contribute/page/savethesenate?express_lane=true&amount=100&refcode=ie_actblue_campaignRefCode_a_express100\">Express Donate: $100</a></strong></center></p>\n\
<p><center><strong><a href=\"https://secure.actblue.com/contribute/page/savethesenate?refcode=ie_actblue_campaignRefCode_a_express_other\">Or donate another amount.</a></strong></center></p>\n\n\
{% endif %}\n\n\
</td></tr></table>\n\n';
      insertAtCaret('markdown_text',askBlock.replace(/campaignRefCode/g, Session.get('refcode')));
  }
});

function insertAtCaret(areaId,text) {
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
