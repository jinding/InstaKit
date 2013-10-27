Template.mobilizeEmailWrapper.facebook_url = function() {
  var str = Session.get("facebook");
  return str.slice(-1) === '/' ? str : str + '/';
}

Template.navBar.buttonText = function() {
  return Session.equals("display", "visual") ? "HTML" : "visual";
};

Template.headline.events({
  'keyup input[type=text]': function() {
    Session.set("headline", $('#headline_text').val());
  }
});

Template.statement_leadin.events({
  'keyup input[type=text]': function() {
    Session.set("statement_leadin", $('#statement_leadin_text').val());
  }
});

Template.petition.events({
  'keyup input[type=text]': function() {
    Session.set("petition", $('#petition_text').val());
  }
});

Template.link.events({
  'keyup input[type=text]': function() {
    Session.set("link", $('#link_text').val());
  }
});

Template.graphic.events({
  'keyup input[type=text]': function() {
    Session.set("graphic", $('#graphic_text').val());
  }
});

Template.graphic_alt.events({
  'keyup input[type=text]': function() {
    Session.set("graphic_alt_text", $('#graphic_alt_text').val());
  }
});

Template.signature.events({
  'keyup input[type=text]': function() {
    Session.set("signature", $('#signature_text').val());
  }
});

Template.footnotes.events({
  'keyup textarea': function() {
    Session.set("footnotes", $('#footnotes_text').val());
  }
});

Template.twitter.events({
  'keyup input[type=text]': function() {
    Session.set("twitter", $('#twitter_text').val());
  }
});

Template.markdown_input.events({
  'keyup textarea': function() {
    Session.set("markdown_data", $('#markdown_text').val());
  }
});

Template.topper.events({
  'keyup textarea': function() {
    Session.set("topper", $('#topper_text').val());
  }
});

Template.facebook.events({
  'keyup input[type=text]': function() {
    Session.set("facebook", $('#facebook_text').val());
  }
});

Template.saveDialog.events({
  'click #cancelSave': function() {
      Session.set("saveDialog",false);
  },
  'click #yesSave': function() {
    var email = {
        id: Session.get("id"),
        type: Session.get("templateChooser"),
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
        twitter: Session.get("twitter"),
        markdown_data: Session.get("markdown_data"),
        creator: Session.get("creator"),
        savedBy: Meteor.user().profile.name
      };

      Meteor.call('saveFile', email, function (err, res) {
        console.log(email);
        if (err)
          Session.set('saveError', err.error);
        else
          Session.set('saveState', res);
      });

      Session.set("showComposePage",false);
      Session.set("saveDialog",false);
  }
});

Template.composePage.events({
  'click #display, click #display_html, click #composeRight': function() {
    Session.set("showNavBar",false);
    Session.set("snippets",false);
    Session.set("toolTips",false);
  },
  'click #display_html': function() {
    var range = document.createRange();
    range.selectNode(document.getElementById("display_html"));
    window.getSelection().addRange(range);  
  }
});

Template.navBar.events({
  'click #buttonDisplay': function(evt) {
    if (Session.equals("display","visual")) {
      Session.set("display","html");
    } else {
      Session.set("display","visual");  
    }
    evt.preventDefault();
  },
  'click #buttonSave': function(evt) {
    if (Session.get("newEmail")) {
      var email = {
        type: Session.get("templateChooser"),
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
        twitter: Session.get("twitter"),
        markdown_data: Session.get("markdown_data"),
        creator: Meteor.user().profile.name,
        savedBy: Meteor.user().profile.name
      };
      Meteor.call('saveFile', email, function (err, res) {
        console.log(email);
        if (err)
          Session.set('saveError', err.error);
        else
          Session.set('saveState', res);
      });
      Session.set("showComposePage",false);
    } else {
      if (Session.equals("creator", Meteor.user().profile.name)) {
        var email = {
          id: Session.get("id"),
          type: Session.get("templateChooser"),
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
          twitter: Session.get("twitter"),
          markdown_data: Session.get("markdown_data"),
          creator: Session.get("creator"),
          savedBy: Meteor.user().profile.name
        };
        Meteor.call('saveFile', email, function (err, res) {
          console.log(email);
          if (err)
            Session.set('saveError', err.error);
          else
            Session.set('saveState', res);
        });
        Session.set("showComposePage",false);
      } else {
        Session.set("saveDialog",true);
      }
    }
  },
  'click .composeNavButton': function() {
    if (Session.get("showNavBar")) {
      Session.set("showNavBar",false);
      Session.set("snippets",false);
      Session.set("toolTips",false);
    } else {
      Session.set("showNavBar",true);
      Session.set("snippets",false);
      Session.set("toolTips",false);
    }
  },
  'click #backToFileScreen': function() {
      Session.set("showComposePage",false);
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
  'click #insertLink': function() {
      var url = '';
      switch (Session.get("templateChooser")) {
        case 'call': url += 'http://act.credoaction.com/call/'; break;
        case 'mobilize': break; // full url provided by user
        case 'event': break; // full url provided by user
        default: url += 'http://act.credoaction.com/sign/'; // petition, take action and public comment
      }
      url += Session.get('link').replace(/_/g,'\\_');
      insertAtCaret('markdown_text','[link](' + url + ')');
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
