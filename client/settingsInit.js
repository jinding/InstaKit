// settings initialization functions

setSessionVarsForSettings = function (obj) {
  Session.set("sessionId", obj._id);
  Session.set("orgName", obj.orgName);
  Session.set("akAuth", obj.akAuth);
  Session.set("akUrl", obj.akUrl);
  Session.set("tagName", obj.tagName);
  Session.set("resourceId", obj.resourceId);
  Session.set("spKey", obj.spKey);
  Session.set("spUrl", obj.spUrl);
  Session.set("bitlyToken", obj.bitlyToken);
  Session.set("newSettings", false);
};

setSessionVarsForNewSettings = function() {
  Session.set("orgName", "");
  Session.set("akAuth", "");
  Session.set("akUrl", "");
  Session.set("tagName", "");
  Session.set("resourceId", "");
  Session.set("spKey", "");
  Session.set("spUrl", "");
  Session.set("bitlyToken", "");
  Session.set("newSettings", true);
};