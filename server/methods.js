Meteor.methods({
  saveFile: function (resp) {
    resp.when = new Date;
    return Files.upsert(resp.id, resp);
  }
});