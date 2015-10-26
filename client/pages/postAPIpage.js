Template.postAPIpage.events({
  'click #buttonBackToPageList': function() {
    Router.go('pages');    
  },
  'click #buttonMakeEmail': function() {
    Router.go('compose', {}, {query: {page: Session.get("id")}});
  }
});

Template.postAPIpage.helpers({
  sharePageEditUrl: function() {
  	return Session.get("pageSharePageLink").replace("http://share.credoaction.com/4/", "https://run.shareprogress.org/pages/") + "/edit";
  }
});