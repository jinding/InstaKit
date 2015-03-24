Template.postAPIpage.events({
  'click #buttonBackToPageList': function() {
    Router.go('pages');    
  },
  'click #buttonMakeEmail': function() {
    Router.go('compose', {}, {query: {page: Session.get("id")}});
  }
});