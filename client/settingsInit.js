// settings initialization functions

setSessionVarsForSettings = function (obj) {
  Session.set("id", obj._id);
  Session.set("orgName", obj.orgName);
  Session.set("akAuth", obj.akAuth);
  Session.set("tagName", obj.tagName);
  Session.set("resourceId", obj.resourceId);
  Session.set("spKey", obj.spKey);
  Session.set("spUrl", obj.spUrl);
  Session.set("bitlyToken", obj.bitlyToken);
};
