var setTags = function(pageTags) {
	var tags = [];
	// always have "credo" as a default tag
	tags.push(Meteor.settings.actionKitApi.actionKitOrgTag);

	for (i=0; i<pageTags.length; i++) {
		tags.push({name: pageTags[i], resource_uri: tagDictionary[pageTags[i]]});
	}
	return tags;
};

var createShareProgressPage = function(page) {
	try {
		var sp = HTTP.call("POST", Meteor.settings.shareProgressApi.shareProgressApiUrl+"pages/update",
				{ headers: {"Content-type": "application/json"},
  				  data: {
					  "key": Meteor.settings.shareProgressApi.key,
					  "page_url": Meteor.settings.shareProgressApi.actionKitUrl+page.pageName,
					  "page_title": page.pageTitle+" | "+Meteor.settings.orgName,
					  "variants": {
					  	"facebook": [{ facebook_title: page.pageFacebookTitle,
					  					facebook_description: page.pageFacebookCopy,
					  					facebook_thumbnail: page.pageGraphicFacebook }],
					  	"email": 	[{ email_subject: page.pageTAFSL,
					  			 		email_body: page.pageTAFCopy }],
					  	"twitter": [{ twitter_message: page.pageTwitterCopy }]
					} // end variants
				  } // end data
				}); // end HTTP
		console.log("ShareProgress page creation successful? " + sp.data.success);
		if (sp.data.success === true)
			return sp.data.response[0];
		else {
			if (sp.data && sp.data.message && sp.data.message.variants[0])
				throw new Meteor.Error(500, sp.data.message.variants[0], sp);
			else throw new Meteor.Error(500, sp.data.message);
		}
	} catch (e) {
		console.log("sp: " + sp);
		if (sp && sp.data && sp.data.message && sp.data.message.variants[0])
			throw new Meteor.Error(500, sp.data.message.variants[0], sp);
		else throw new Meteor.Error(500, "Error creating share page");
	}
}

var updateTwitterForAK = function(str, bitly) {
	return str.replace(/{ *LINK *}/i, bitly);
}

var updateTAFCopyForAK = function(str) {
	return str.replace(/{ *LINK *}/i, "{{ page.canonical_url }}");
}

var updatePageShare = function(page, loc, bitly) {
	// create new petition page.
	try {
		var updatePage = HTTP.call("PUT", loc,
						 {auth: Meteor.settings.actionKitApi.actionKitAuth,
  						  headers: {"Content-type": "application/json"},
                          data: {
                      			name: page.pageName,
                      			title: page.pageTitle,
                      			allow_multiple_responses: false,
                      			fields: { 
                      			 	"image_email_180": page.pageGraphicEmail,
									"image_homepage_100": page.pageGraphicHomePage,
									"image_facebook_114": page.pageGraphicFacebook,
									"taf_facebook_title": page.pageFacebookTitle,
									"taf_facebook_copy": page.pageFacebookCopy,
									"taf_tweet": updateTwitterForAK(page.pageTwitterCopy,bitly),
									"therm_landing_page": 1
                      			}, // end fields
                      			goal_type: "users",
                      			one_click: false,
//                      			recognize: "never",
                      			required_fields: [
                      			 	{   id: 2,
										name: "zip",
										resource_uri: "/rest/v1/formfield/2/"},
									{   id: 6,
									    name: "first_name",
									    resource_uri: "/rest/v1/formfield/6/"},
									{   id: 7,
									    name: "last_name",
									    resource_uri: "/rest/v1/formfield/7/"},
									{   id: 11,
									    name: "name",
									    resource_uri: "/rest/v1/formfield/11/"}
								], // end required_fields
								tags: setTags(page.pageTags)
                      		} // end data
                      });		
		return true; 
	} catch (e) {
		if (e.response.statusCode && e.response.statusCode === 400)
        	throw new Meteor.Error(e.response.statusCode, e.response.content, e.response);
        else
        	throw new Meteor.Error(500, "Unknown error updating page share fields", e.response.data);
	}
};

var updatePageForm = function(page,resource) {
	// create the petition cms form and set its page to the petition page resource_uri.
	// doing this automatically updates the petition page to find this form
	try {
	  console.log("in updatePageForm "+resource);
	  if (page.pageType === "letter")
		  var createPageForm = HTTP.call("POST", Meteor.settings.actionKitApi.actionKitUrl+"rest/v1/letterform/",
		  						 {auth: Meteor.settings.actionKitApi.actionKitAuth,
		  						  headers: {"Content-type": "application/json"},
		                          data: {about_text: page.pageImportAboutText, // "Import" text is HTML version
		                      			 page: resource,
		                      			 statement_leadin: page.pageImportStatementLeadIn, 
		                      			 letter_text: page.pageStatementText, // letter_text does not take HTML
		                      			 thank_you_text: "thank you"					             
		                      			} // end data
		                      });		
	  else var createPageForm = HTTP.call("POST", Meteor.settings.actionKitApi.actionKitUrl+"rest/v1/petitionform/",
	  						 {auth: Meteor.settings.actionKitApi.actionKitAuth,
	  						  headers: {"Content-type": "application/json"},
	                          data: {about_text: page.pageImportAboutText, // "Import" text is HTML version
	                      			 page: resource,
	                      			 statement_leadin: page.pageImportStatementLeadIn,
	                      			 statement_text: page.pageImportStatementText, // push in HTML version of text
	                      			 thank_you_text: "thank you"					             
	                      			} // end data
	                      });		
	  console.log(createPageForm.headers.location);
	  return createPageForm.headers.location;
	} catch (e) {
		if (e.response.statusCode && e.response.statusCode === 400)
        	throw new Meteor.Error(e.response.statusCode, e.response.content, e.response);
        else
        	throw new Meteor.Error(500, "Unknown error updating page form", e.response.data);
  	}
};

var updatePageFields = function(page,resource,sp) {
	try {
	  console.log("in updatePageFields "+resource);
	  var addPageFields = HTTP.call("POST", Meteor.settings.actionKitApi.actionKitUrl+"rest/v1/pagefollowup/",
	  							{auth: Meteor.settings.actionKitApi.actionKitAuth,
	  							 headers: {"Content-type": "application/json"},
	  							 data: {
	                      			page: resource,
                      			 	email_body: page.pageImportConfEmailBody,
                      			 	email_from_line: senderDictionary[page.pageConfEmailSender],
                      			 	email_subject: page.pageConfEmailSL,
                      			 	send_email: true,
                      			 	send_taf: true,
                      			 	taf_body: updateTAFCopyForAK(page.pageTAFCopy),
                      			 	taf_subject: page.pageTAFSL,
                      			 	url: sp
	  							 } // end data
	  							} // end auth
	  						);
	  console.log(addPageFields.headers.location);
	  return addPageFields.headers.location;
	} catch (e) {
		if (e.response.statusCode && e.response.statusCode === 400)
        	throw new Meteor.Error(e.response.statusCode, e.response.content, e.response);
        else
        	throw new Meteor.Error(500, "Unknown error updating page after-action fields", e.response.data);
  	}
};

var createShortLink = function(page) {
	try {
		var bitly = HTTP.call("GET", "https://api-ssl.bitly.com/v3/shorten",
					{
		  				params: {
							access_token: Meteor.settings.bitlyApi.access_token,
		  					longUrl: Meteor.settings.bitlyApi.longUrl+page.pageName+"/?source=tw1"
		  				}
					});
		return bitly.data.data.url;
	} catch (e) {
		if (e.response.data.statusCode && e.response.data.statusCode === 400)
        	throw new Meteor.Error(e.response.data.statusCode, e.response.data.status_txt, e.response);
        else
        	throw new Meteor.Error(500, "Unknown error updating page after-action fields", e.response.data);
	}
};

// functions for updating an already created AK page

var updatePageShareForCreatedPage = function(page, loc, bitly) {
	// update petition page that already exists in AK
	try {
		var updatePage = HTTP.call("PUT", loc,
						 {auth: Meteor.settings.actionKitApi.actionKitAuth,
  						  headers: {"Content-type": "application/json"},
                          data: {
                      			name: page.pageName,
                      			title: page.pageTitle,
                      			allow_multiple_responses: false,
                      			fields: { 
                      			 	"image_email_180": page.pageGraphicEmail,
									"image_homepage_100": page.pageGraphicHomePage,
									"image_facebook_114": page.pageGraphicFacebook,
									"taf_facebook_title": page.pageFacebookTitle,
									"taf_facebook_copy": page.pageFacebookCopy,
									"taf_tweet": updateTwitterForAK(page.pageTwitterCopy,bitly),
									"therm_landing_page": 1
                      			}, // end fields
                      			goal_type: "users",
                      			one_click: false,
//                      			recognize: "never",
                      			required_fields: [
                      			 	{   id: 2,
										name: "zip",
										resource_uri: "/rest/v1/formfield/2/"},
									{   id: 6,
									    name: "first_name",
									    resource_uri: "/rest/v1/formfield/6/"},
									{   id: 7,
									    name: "last_name",
									    resource_uri: "/rest/v1/formfield/7/"},
									{   id: 11,
									    name: "name",
									    resource_uri: "/rest/v1/formfield/11/"}
								], // end required_fields
								tags: setTags(page.pageTags)
                      		} // end data
                      });		
		return true; 
	} catch (e) {
		console.log("error in updatePageShareForCreatedPage");
		console.log(e.response);
		if (e.response.statusCode && e.response.statusCode === 400)
        	throw new Meteor.Error(e.response.statusCode, e.response.content, e.response);
        else
        	throw new Meteor.Error(500, "Unknown error updating page share fields for previously created page", e.response.data);
	}
};

var updatePageFormForCreatedPage = function(page,loc) {
	// create the petition cms form and set its page to the petition page resource_uri.
	// doing this automatically updates the petition page to find this form
	try {
	  console.log("in updatePageFormForCreatedPage form uri "+loc);
	  if (page.pageType === "letter")
	  	var updatePageForm = HTTP.call("PUT", loc,
	  						 {auth: Meteor.settings.actionKitApi.actionKitAuth,
	  						  headers: {"Content-type": "application/json"},
	                          data: {about_text: page.pageImportAboutText,
	                      			 page: page.AKpageResourceURI,
	                      			 statement_leadin: page.pageImportStatementLeadIn,
	                      			 letter_text: page.pageStatementText, // no HTML for letter_text	             
	                      			 thank_you_text: "thank you"
	                      			} // end data
	                     	 });		
	  else var updatePageForm = HTTP.call("PUT", loc,
	  						 {auth: Meteor.settings.actionKitApi.actionKitAuth,
	  						  headers: {"Content-type": "application/json"},
	                          data: {about_text: page.pageImportAboutText,
	                      			 page: page.AKpageResourceURI,
	                      			 statement_leadin: page.pageImportStatementLeadIn,
	                      			 statement_text: page.pageImportStatementText,			             
	                      			 thank_you_text: "thank you"
	                      			} // end data
	                     	 });		
	  return true;
	} catch (e) {
		console.log("error in updatePageFormForCreatedPage");
		console.log(e.response);
		if (e.response.statusCode && e.response.statusCode === 400)
        	throw new Meteor.Error(e.response.statusCode, e.response.content, e.response);
        else
        	throw new Meteor.Error(500, "Unknown error updating page form for created page", e.response.data);
  	}
};

var updatePageFieldsForCreatedPage = function(page,loc,sp) {
	try {
	  console.log("in updatePageFieldsForCreatedPage "+loc);
	  var updatePageFields = HTTP.call("PUT", loc,
	  							{auth: Meteor.settings.actionKitApi.actionKitAuth,
	  							 headers: {"Content-type": "application/json"},
	  							 data: {
	                      			page: page.AKpageResourceURI,
                      			 	email_body: page.pageImportConfEmailBody,
                      			 	email_from_line: senderDictionary[page.pageConfEmailSender],
                      			 	email_subject: page.pageConfEmailSL,
                      			 	taf_body: updateTAFCopyForAK(page.pageTAFCopy),
                      			 	taf_subject: page.pageTAFSL,
                      			 	url: sp
	  							 } // end data
	  							} // end auth
	  						);
	  return true;
	} catch (e) {
		console.log("error in updatePageFieldsForCreatedPage");
		console.log(e.response);
		if (e.response.statusCode && e.response.statusCode === 400)
        	throw new Meteor.Error(e.response.statusCode, e.response.content, e.response);
        else
        	throw new Meteor.Error(500, "Unknown error updating page after-action fields for created page", e.response.data);
  	}
};

var updateShareProgressPageForCreatedPage = function(page) {
	try {
		var loc = page.pageSharePageLink.replace(Meteor.settings.shareProgressApi.shareProgressUrl,"");
		console.log("in updateShareProgressPageForCreatedPage " + loc);
		var res = HTTP.call("GET", Meteor.settings.shareProgressApi.shareProgressApiUrl+"pages/read",
				{ headers: {"Content-type": "application/json"},
				  data: {
				  	id: loc,
					"key": Meteor.settings.shareProgressApi.key
				  }
				}); // end GET
		var variants = res.data.response[0].variants;
		var sp = HTTP.call("POST", Meteor.settings.shareProgressApi.shareProgressApiUrl+"pages/update",
				{ headers: {"Content-type": "application/json"},
  				  data: {
  				  	  id: loc,
					  "key": Meteor.settings.shareProgressApi.key,
					  "page_url": Meteor.settings.shareProgressApi.actionKitUrl+page.pageName,
					  "page_title": page.pageTitle+" | "+Meteor.settings.orgName,
					  "auto_fill": true,
					  "variants": {
					  	"facebook": [{  id: variants.facebook[0].id,
					  					facebook_title: page.pageFacebookTitle,
					  					facebook_description: page.pageFacebookCopy,
					  					facebook_thumbnail: page.pageGraphicFacebook }],
					  	"email": 	[{  id: variants.email[0].id,
					  					email_subject: page.pageTAFSL,
					  			 		email_body: page.pageTAFCopy }],
					  	"twitter": [{   id: variants.twitter[0].id,
					  					twitter_message: page.pageTwitterCopy }]
					} // end variants
				  } // end data
				}); // end HTTP
		console.log("ShareProgress page creation successful? " + sp.data.success);
		if (sp.data.success === true)
			return sp.data.response[0];
		else {
			if (sp.data.message && sp.data.message.variants[0])
				throw new Meteor.Error(500, sp.data.message.variants[0], sp);
			else throw new Meteor.Error(500, sp.data.message);
		}	
	} catch (e) {
		if (sp.data.message && sp.data.message.variants[0])
			throw new Meteor.Error(500, sp.data.message.variants[0], sp);
		else throw new Meteor.Error(500, "Error creating share page");
	}
};



Meteor.methods({
  saveFile: function (resp) {
    resp.when = new Date;
    return Files.upsert(resp.id, resp);
  },
  createAKpage: function (page) {
	  // create new petition page.
	try {
		if (page.pageType === "letter") 
			var createPage = HTTP.call("POST", Meteor.settings.actionKitApi.actionKitUrl+"rest/v1/letterpage/",
	  						 {auth: Meteor.settings.actionKitApi.actionKitAuth,
	  						  headers: {"Content-type": "application/json"},
	                          data: {
	                      			name: page.pageName       
	                      		} // end data
	                      });
		else var createPage = HTTP.call("POST", Meteor.settings.actionKitApi.actionKitUrl+"rest/v1/petitionpage/",
	  						 {auth: Meteor.settings.actionKitApi.actionKitAuth,
	  						  headers: {"Content-type": "application/json"},
	                          data: {
	                      			name: page.pageName       
	                      		} // end data
	                      });		
		return createPage.headers.location; 
	} catch (e) {
		console.log(e.response);
		if (e.response && e.response.statusCode && e.response.statusCode === 400)
			if (e.response.data && e.response.data.petitionpage && e.response.data.petitionpage.name[0])
	        	throw new Meteor.Error(e.response.statusCode, e.response.data.petitionpage.name[0], e.response);
	        else throw new Meteor.Error(e.response.statusCode, e.response.content, e.response);
        else
        	throw new Meteor.Error(500, "Unknown error creating page", e.response.data);
	}
  },
  populateAKpage: function (page,loc) {
  	var bitly = createShortLink(page);
  	console.log("returned by bitly: "+bitly);
  	var AK = HTTP.call("GET", loc, {auth: Meteor.settings.actionKitApi.actionKitAuth}).data;
  	console.log(AK);
  	updatePageShare(page, loc, bitly);
  	updatePageForm(page, AK.resource_uri);
	var sp = createShareProgressPage(page);
	console.log("shareprogress returns ",sp);
  	updatePageFields(page, AK.resource_uri, sp.share_page_url);
  	var pageObj = {};
  	pageObj.AKpage = Meteor.settings.actionKitApi.actionKitUrl.replace("https:","http:")+"sign/" + page.pageName;
  	if (page.pageType === "letter") 
  		pageObj.AKpageEdit = Meteor.settings.actionKitApi.actionKitUrl+"admin/core/letterpage/" + AK.id;
  	else pageObj.AKpageEdit = Meteor.settings.actionKitApi.actionKitUrl+"admin/core/petitionpage/" + AK.id;
  	pageObj.SPpage = sp.share_page_url;
  	pageObj.bitly = bitly;
  	pageObj.pageID = AK.id;
  	pageObj.resource_uri = AK.resource_uri;
  	return pageObj;
  },
  updateAKpage: function (page) {
	// update page already created in AK
	try {
		// resource URI location is based on page_id so does not change with an edit
		var loc = Meteor.settings.actionKitApi.actionKitUrl+page.AKpageResourceURI;
		console.log("page resource URI: "+ loc);

		// update new bitly link in case page short name was edited
	  	var bitly = createShortLink(page);
	  	console.log("returned by bitly: "+bitly);

	  	// overwrite page title, name and custom fields
	  	// eventually need to check for error that updated page name conflicts with another page in AK
		updatePageShareForCreatedPage(page, loc, bitly);

		// get resource_uris for page fields and page form
	  	var AK = HTTP.call("GET", loc, {auth: Meteor.settings.actionKitApi.actionKitAuth}).data;
	  	var cmsForm = AK.cms_form;
	  	var followupPageFields = AK.followup.resource_uri;

		// modify SP page
		var sp = updateShareProgressPageForCreatedPage(page);
		console.log("shareprogress returns ",sp.share_page_url);

	  	updatePageFormForCreatedPage(page, Meteor.settings.actionKitApi.actionKitUrl+cmsForm);
	  	updatePageFieldsForCreatedPage(page, Meteor.settings.actionKitApi.actionKitUrl+followupPageFields, sp.share_page_url);

	  	var pageObj = {};
	  	pageObj.AKpage = Meteor.settings.actionKitApi.actionKitUrl.replace("https:","http:")+"sign/" + page.pageName;
	  	if (page.pageType === "letter") 
	  		pageObj.AKpageEdit = Meteor.settings.actionKitApi.actionKitUrl+"admin/core/letterpage/" + page.AKpageID;
	  	else pageObj.AKpageEdit = Meteor.settings.actionKitApi.actionKitUrl+"admin/core/petitionpage/" + page.AKpageID;
	  	pageObj.SPpage = sp.share_page_url;
	  	pageObj.bitly = bitly;
	  	pageObj.pageID = page.AKpageID;
	  	pageObj.resource_uri = page.AKpageResourceURI;
	  	return pageObj;

	} catch (e) {
		console.log(e.response);
		if (e.response.statusCode && e.response.statusCode === 400)
			if (e.response.data && e.response.data.petitionpage && e.response.data.petitionpage.name[0])
	        	throw new Meteor.Error(e.response.statusCode, e.response.data.petitionpage.name[0], e.response);
	        else throw new Meteor.Error(e.response.statusCode, e.response.content, e.response);
        else
        	throw new Meteor.Error(500, "Unknown error updating page", e.response.data);
	}
  },

  // -----------------------  EVENTS ---------------------------- //

  eventCreateUmbrella: function(eventUmbrella) {
  	try {
  		// REMEMBER TO CHANGE THIS BACK TO CREDO FROM ROBOTIC DOGS AND USER AUTH
  		var createEventUmbrella = HTTP.call("POST", Meteor.settings.actionKitApi.actionKitUrl+"rest/v1/campaign/",
	  						 {auth: Meteor.settings.actionKitApi.actionKitAuth,
	  						  headers: {"Content-type": "application/json"},
	                          data: {
	                      			name: eventUmbrella.pageName,
	                      			title: eventUmbrella.pageTitle,
	                      			default_event_size: eventUmbrella.eventDefaultSize,
	                      			max_event_size: "2500",
	                      			default_title: eventUmbrella.eventDefaultTitle,
	                      			public_create_page: true,
	                      			starts_at: eventUmbrella.eventStartDate + " " + eventUmbrella.eventStartTime
	                      		} // end data
	                      });
  		console.log(createEventUmbrella.headers.location);
   		return createEventUmbrella.headers.location;

  	} catch (e) {
		console.log(e.response);
		if (e.response.statusCode && e.response.statusCode === 400)
			if (e.response.data && e.response.data.petitionpage && e.response.data.petitionpage.name[0])
	        	throw new Meteor.Error(e.response.statusCode, e.response.data.petitionpage.name[0], e.response);
	        else throw new Meteor.Error(e.response.statusCode, e.response.content, e.response);
        else
        	throw new Meteor.Error(500, "Unknown error creating event umbrella", e.response.data);

  	}
  },
  eventCreateHostPage: function(loc, eventUmbrella) {
  	try {
   		// REMEMBER TO CHANGE THIS BACK TO CREDO FROM ROBOTIC DOGS AND USER AUTH
  		var eventUmbrellaURI = loc.replace(Meteor.settings.actionKitApi.actionKitUrl,"");

  		console.log(eventUmbrellaURI);

  		// REMEMBER TO CHANGE THIS BACK TO CREDO FROM ROBOTIC DOGS AND USER AUTH
  		var createEventHostPage = HTTP.call("POST", Meteor.settings.actionKitApi.actionKitUrl+"rest/v1/eventcreatepage/",
	  						 {auth: Meteor.settings.actionKitApi.actionKitAuth,
	  						  headers: {"Content-type": "application/json"},
	                          data: {
	                          		campaign: eventUmbrellaURI,
	                          		//list: "/rest/v1/campaign/1/",
	                      			name: eventUmbrella.pageName + "_host",
	                      			title: eventUmbrella.pageTitle + " - Host",
	                      			required_fields: [
	                      			 	{   id: 2,
											name: "zip",
											resource_uri: "/rest/v1/formfield/2/"},
										{   id: 6,
										    name: "first_name",
										    resource_uri: "/rest/v1/formfield/6/"},
										{   id: 7,
										    name: "last_name",
										    resource_uri: "/rest/v1/formfield/7/"},
										{   id: 11,
										    name: "name",
										    resource_uri: "/rest/v1/formfield/11/"}
									], // end required_fields
									tags: Meteor.settings.actionKitApi.actionKitOrgTag
	                      		} // end data
	                      });
  		console.log("eventHost URL " + createEventHostPage.headers.location);
 		var eventHostURL = createEventHostPage.headers.location.replace(Meteor.settings.actionKitApi.actionKitUrl,"");
  		var createEventHostForm = HTTP.call("POST", Meteor.settings.actionKitApi.actionKitUrl+"rest/v1/eventcreateform/",
	  						 {auth: Meteor.settings.actionKitApi.actionKitAuth,
	  						  headers: {"Content-type": "application/json"},
	                          data: {
	                          		page: eventHostURL,
	                          		thank_you_text: "Thanks for hosting"
	                      		} // end data
	                      });
  		console.log("eventHostForm URL " + createEventHostForm.headers.location);

 		return createEventHostPage.headers.location;

  	} catch (e) {
		console.log(e.response);
		if (e.response.statusCode && e.response.statusCode === 400)
			if (e.response.data && e.response.data.petitionpage && e.response.data.petitionpage.name[0])
	        	throw new Meteor.Error(e.response.statusCode, e.response.data.petitionpage.name[0], e.response);
	        else throw new Meteor.Error(e.response.statusCode, e.response.content, e.response);
        else
        	throw new Meteor.Error(500, "Unknown error creating event host page", e.response.data);

  	}
  },
  eventCreateSignupPage: function(eventUmbrella) {
 	try {
   		// REMEMBER TO CHANGE THIS BACK TO CREDO FROM ROBOTIC DOGS AND USER AUTH
  		var eventUmbrellaURI = eventUmbrella.eventUmbrellaCampaignURL.replace(Meteor.settings.actionKitApi.actionKitUrl,"");

  		console.log(eventUmbrellaURI);
  		
  		// REMEMBER TO CHANGE THIS BACK TO CREDO FROM ROBOTIC DOGS AND USER AUTH
  		var createEventSignupPage = HTTP.call("POST", Meteor.settings.actionKitApi.actionKitUrl+"rest/v1/eventsignuppage/",
	  						 {auth: Meteor.settings.actionKitApi.actionKitAuth,
	  						  headers: {"Content-type": "application/json"},
	                          data: {
	                          		campaign: eventUmbrellaURI,
	                          		//list: "/rest/v1/campaign/1/",
	                      			name: eventUmbrella.pageName + "_attend",
	                      			title: eventUmbrella.pageTitle + " - Attend",
	                      			required_fields: [
	                      			 	{   id: 2,
											name: "zip",
											resource_uri: "/rest/v1/formfield/2/"},
										{   id: 6,
										    name: "first_name",
										    resource_uri: "/rest/v1/formfield/6/"},
										{   id: 7,
										    name: "last_name",
										    resource_uri: "/rest/v1/formfield/7/"},
										{   id: 11,
										    name: "name",
										    resource_uri: "/rest/v1/formfield/11/"}
									], // end required_fields
									tags: Meteor.settings.actionKitApi.actionKitOrgTag
	                      		} // end data
	                      });
  		console.log("eventSignup URL " + createEventSignupPage.headers.location);
  		var eventSignupURL = createEventSignupPage.headers.location.replace(Meteor.settings.actionKitApi.actionKitUrl,"");
  		var createEventSignupForm = HTTP.call("POST", Meteor.settings.actionKitApi.actionKitUrl+"rest/v1/eventsignupform/",
	  						 {auth: Meteor.settings.actionKitApi.actionKitAuth,
	  						  headers: {"Content-type": "application/json"},
	                          data: {
	                          		page: eventSignupURL,
//	                          		signup_text: "Signup for our event!",
	                          		thank_you_text: "Thanks for signing up"
	                      		} // end data
	                      });
	    console.log("eventSignupForm URL " + createEventSignupForm.headers.location);

		var addPageFields = HTTP.call("POST", Meteor.settings.actionKitApi.actionKitUrl+"rest/v1/pagefollowup/",
									{auth: Meteor.settings.actionKitApi.actionKitAuth,
									 headers: {"Content-type": "application/json"},
									 data: {
		                  			page: eventSignupURL,
		              			 	email_body: eventUmbrella.pageImportConfEmailBody,
		              			 	email_subject: eventUmbrella.pageConfEmailSL,
		              			 	send_email: true,
		              			 	send_taf: true,
//		              			 	taf_body: updateTAFCopyForAK(page.pageTAFCopy),
//		              			 	taf_subject: page.pageTAFSL,
		              			 	url: "/cms/thanks/"+eventUmbrella.pageName+"_attend"
									 } // end data
									} // end auth
								);
		console.log(addPageFields.headers.location);

 		return createEventSignupPage.headers.location;

  	} catch (e) {
		console.log(e.response);
		if (e.response.statusCode && e.response.statusCode === 400)
			if (e.response.data && e.response.data.petitionpage && e.response.data.petitionpage.name[0])
	        	throw new Meteor.Error(e.response.statusCode, e.response.data.petitionpage.name[0], e.response);
	        else throw new Meteor.Error(e.response.statusCode, e.response.content, e.response);
        else
        	throw new Meteor.Error(500, "Unknown error creating event signup page", e.response.data);

  	}
  }, 
  eventCreateSubEvent: function(subEvent) {
  	try {
  		var eventUmbrellaURI = subEvent.eventUmbrellaCampaignURL.replace(Meteor.settings.actionKitApi.actionKitUrl,"");

		var host = HTTP.call("GET", 
			Meteor.settings.actionKitApi.actionKitUrl+"rest/v1/user/?email=" + subEvent.subEventHostEmail,
			{auth: Meteor.settings.actionKitApi.actionKitAuth}).data;

		console.log(host.objects[0].resource_uri);  

  		var createSubEvent = HTTP.call("POST", Meteor.settings.actionKitApi.actionKitUrl+"rest/v1/event/",
	  						 {auth: Meteor.settings.actionKitApi.actionKitAuth,
	  						  headers: {"Content-type": "application/json"},
	                          data: {
	                          		campaign: eventUmbrellaURI,
	                          		creator: host.objects[0].resource_uri,
	                      			title: subEvent.subEventTitle,
	                      			max_attendees: subEvent.subEventMaxAttendees,
	                      			venue: subEvent.subEventVenue,
	                      			directions: subEvent.subEventDirections,
	                      			public_description: subEvent.subEventPublicDescription,
	                      			note_to_attendees: subEvent.subEventNoteToAttendees,
	                      			starts_at: subEvent.subEventStartsAt,
	                      			address1: subEvent.subEventAddress1,
	                      			address2: subEvent.subEventAddress2,
	                      			city: subEvent.subEventCity,
	                      			state: subEvent.subEventState,
	                      			zip: subEvent.subEventZip,
	                      			host_is_confirmed: true
	                      		} // end data
	                      });
  		console.log(createSubEvent.headers.location);
  		console.log("event: " + createSubEvent.headers.location.replace(Meteor.settings.actionKitApi.actionKitUrl,""));
  		console.log("page: " + subEvent.eventUmbrellaHostURL.replace(Meteor.settings.actionKitApi.actionKitUrl,""));

  		var createHostSignup = HTTP.call("POST", Meteor.settings.actionKitApi.actionKitUrl+"rest/v1/eventsignup/",
	  						 {auth: Meteor.settings.actionKitApi.actionKitAuth,
	  						  headers: {"Content-type": "application/json"},
	                          data: {
	                          		event: createSubEvent.headers.location.replace(Meteor.settings.actionKitApi.actionKitUrl,""),
	                          		page: subEvent.eventUmbrellaHostURL.replace(Meteor.settings.actionKitApi.actionKitUrl,""),
	                          		role: "host",
	                          		status: "active",
	                          		user: host.objects[0].resource_uri
	                      		} // end data
	                      });
  		console.log(createHostSignup.headers.location);

 		return createSubEvent.headers.location;

  	} catch (e) {
		console.log(e.response);
		if (e.response.statusCode && e.response.statusCode === 400)
			if (e.response.data && e.response.data.petitionpage && e.response.data.petitionpage.name[0])
	        	throw new Meteor.Error(e.response.statusCode, e.response.data.petitionpage.name[0], e.response);
	        else throw new Meteor.Error(e.response.statusCode, e.response.content, e.response);
        else
        	throw new Meteor.Error(500, "Unknown error creating sub event", e.response.data);

  	}
  }
});

var senderDictionary = {
	"CREDO Action": "/rest/v1/fromline/1/",
	"CREDO SuperPAC": "/rest/v1/fromline/18/",
	"Becky Bond, CREDO Action": "/rest/v1/fromline/3/",
	"Becky Bond, CREDO SuperPAC": "/rest/v1/fromline/13/",
	"Elijah Zarlin, CREDO Action": "/rest/v1/fromline/4/",
	"Heidi Hess, CREDO Action": "/rest/v1/fromline/15/",
	"Jordan Krueger, CREDO Action": "/rest/v1/fromline/2/",
	"Josh Nelson, CREDO Action": "/rest/v1/fromline/8/",
	"Michael Kieschnick, CREDO Action": "/rest/v1/fromline/11/",
	"Murshed Zaheed, CREDO Action": "/rest/v1/fromline/5/",
	"Zack Malitz, CREDO Action": "/rest/v1/fromline/7/",
	"Zack Malitz, CREDO SuperPAC": "/rest/v1/fromline/19/"
};

var tagDictionary = {
  "women": "/rest/v1/tag/1/",
  "choice": "/rest/v1/tag/2/",
  "environment": "/rest/v1/tag/3/",
  "fracking": "/rest/v1/tag/4/",
  "economic": "/rest/v1/tag/5/",
  "accountability": "/rest/v1/tag/6/",
  "coal": "/rest/v1/tag/7/",
  "food": "/rest/v1/tag/8/",
  "guns": "/rest/v1/tag/9/",
  "health": "/rest/v1/tag/10/",
  "voting": "/rest/v1/tag/11/",
  "Jin": "/rest/v1/tag/12/",
  "trade": "/rest/v1/tag/13/",
  "immigration": "/rest/v1/tag/14/",
  "labor": "/rest/v1/tag/15/",
  "homepage": "/rest/v1/tag/16/",
  "kicker": "/rest/v1/tag/17/",
  "chaser": "/rest/v1/tag/18/",
  "test": "/rest/v1/tag/19/",
  "local": "/rest/v1/tag/20/",
  "national": "/rest/v1/tag/21/",
  "organize": "/rest/v1/tag/22/",
  "petition": "/rest/v1/tag/23/",
  "call": "/rest/v1/tag/24/",
  "public_comment": "/rest/v1/tag/25/",
  "event": "/rest/v1/tag/26/",
  "fundraiser": "/rest/v1/tag/27/",
  "paid": "/rest/v1/tag/28/",
  "core": "/rest/v1/tag/29/",
  "lgbt": "/rest/v1/tag/30/",
  "reactivation": "/rest/v1/tag/31/",
  "credo": "/rest/v1/tag/32/",
  "dailykos": "/rest/v1/tag/33/",
  "allenwest": "/rest/v1/tag/34/",
  "superpac": "/rest/v1/tag/35/",
  "afghanistan": "/rest/v1/tag/36/",
  "bachmann": "/rest/v1/tag/37/",
  "baddems": "/rest/v1/tag/38/",
  "blackwater": "/rest/v1/tag/39/",
  "budget": "/rest/v1/tag/40/",
  "chamber": "/rest/v1/tag/41/",
  "citizensunited": "/rest/v1/tag/42/",
  "civilrights": "/rest/v1/tag/43/",
  "clarencethomas": "/rest/v1/tag/44/",
  "cleanairact": "/rest/v1/tag/45/",
  "climate": "/rest/v1/tag/46/",
  "corporations": "/rest/v1/tag/47/",
  "deathpenalty": "/rest/v1/tag/48/",
  "debtceiling": "/rest/v1/tag/49/",
  "drilling": "/rest/v1/tag/50/",
  "education": "/rest/v1/tag/51/",
  "filibuster": "/rest/v1/tag/52/",
  "financial": "/rest/v1/tag/53/",
  "fox": "/rest/v1/tag/54/",
  "healthcare": "/rest/v1/tag/55/",
  "judges": "/rest/v1/tag/56/",
  "marriage": "/rest/v1/tag/57/",
  "media": "/rest/v1/tag/58/",
  "medicare": "/rest/v1/tag/59/",
  "netneutrality": "/rest/v1/tag/60/",
  "nuclear": "/rest/v1/tag/61/",
  "palin": "/rest/v1/tag/62/",
  "peace": "/rest/v1/tag/63/",
  "pollution": "/rest/v1/tag/64/",
  "publicbroadcasting": "/rest/v1/tag/65/",
  "race": "/rest/v1/tag/66/",
  "rhetoric": "/rest/v1/tag/67/",
  "senatereform": "/rest/v1/tag/68/",
  "socialsecurity": "/rest/v1/tag/69/",
  "tarsands": "/rest/v1/tag/70/",
  "taxes": "/rest/v1/tag/71/",
  "torture": "/rest/v1/tag/72/",
  "war": "/rest/v1/tag/73/",
  "wiretapping": "/rest/v1/tag/74/",
  "gmo": "/rest/v1/tag/75/",
  "finance": "/rest/v1/tag/76/",
  "progressivesunited": "/rest/v1/tag/77/",
  "demsdotcom": "/rest/v1/tag/78/",
  "colorofchange": "/rest/v1/tag/79/",
  "wind": "/rest/v1/tag/80/",
  "hlinko": "/rest/v1/tag/81/",
  "Iran": "/rest/v1/tag/82/",
  "solar": "/rest/v1/tag/83/",
  "rebuildthedream": "/rest/v1/tag/84/",
  "renewables": "/rest/v1/tag/85/",
  "risingtide": "/rest/v1/tag/86/",
  "drones": "/rest/v1/tag/87/",
  "fan": "/rest/v1/tag/88/",
  "toxic": "/rest/v1/tag/89/",
  "bees": "/rest/v1/tag/90/",
  "presente": "/rest/v1/tag/91/",
  "international": "/rest/v1/tag/92/",
  "mining": "/rest/v1/tag/93/",
  "welcome_email": "/rest/v1/tag/94/",
  "sweep": "/rest/v1/tag/95/",
  "launch": "/rest/v1/tag/96/",
  "rollout": "/rest/v1/tag/97/",
  "dontuse": "/rest/v1/tag/98/",
  "specialprojects": "/rest/v1/tag/99/",
  "actblue": "/rest/v1/tag/100/",
  "rootsaction": "/rest/v1/tag/101/",
  "drugs": "/rest/v1/tag/102/",
  "privatization": "/rest/v1/tag/103/",
  "seniors": "/rest/v1/tag/104/",
  "animals": "/rest/v1/tag/105/",
  "grassroots": "/rest/v1/tag/106/",
  "waunited": "/rest/v1/tag/107/",
  "changedotorg_signers": "/rest/v1/tag/108/",
  "elizabethwarren": "/rest/v1/tag/109/",
  "demandprogress": "/rest/v1/tag/110/",
  "PlannedParenthood": "/rest/v1/tag/128/",
  "reginaschwartz": "/rest/v1/tag/129/",
  "neworganizing": "/rest/v1/tag/130/",
  "netrootsnation": "/rest/v1/tag/131/",
  "pccc": "/rest/v1/tag/132/",
  "sierraclub": "/rest/v1/tag/133/",
  "arctic": "/rest/v1/tag/134/",
  "usaction": "/rest/v1/tag/135/",
  "sumofus": "/rest/v1/tag/136/",
  "tp10": "/rest/v1/tag/137/",
  "motherjones": "/rest/v1/tag/138/",
  "votevets": "/rest/v1/tag/139/",
  "mortgage": "/rest/v1/tag/140/",
  "steveking": "/rest/v1/tag/141/",
  "ewg": "/rest/v1/tag/142/",
  "conservation": "/rest/v1/tag/143/",
  "studentloans": "/rest/v1/tag/144/",
  "joewalsh": "/rest/v1/tag/145/",
  "control": "/rest/v1/tag/146/",
  "treatment": "/rest/v1/tag/147/",
  "chamberofcommerce": "/rest/v1/tag/148/",
  "non_action_page": "/rest/v1/tag/149/",
  "no_akid_mailing": "/rest/v1/tag/150/",
  "taxcannibus": "/rest/v1/tag/151/",
  "elections": "/rest/v1/tag/152/",
  "saveourenvironment": "/rest/v1/tag/153/",
  "eff": "/rest/v1/tag/154/",
  "occupy": "/rest/v1/tag/155/",
  "donors": "/rest/v1/tag/156/",
  "denner": "/rest/v1/tag/157/",
  "upworthy_email": "/rest/v1/tag/158/",
  "kamalaharris": "/rest/v1/tag/159/",
  "emilyslist": "/rest/v1/tag/160/",
  "other98": "/rest/v1/tag/161/",
  "patriotact": "/rest/v1/tag/162/",
  "ssworks": "/rest/v1/tag/163/",
  "boehner": "/rest/v1/tag/164/",
  "ericcantor": "/rest/v1/tag/165/",
  "monsanto": "/rest/v1/tag/166/",
  "fdn": "/rest/v1/tag/167/",
  "rickperry": "/rest/v1/tag/168/",
  "doublehit": "/rest/v1/tag/169/",
  "upworthy_holler": "/rest/v1/tag/170/",
  "uganda": "/rest/v1/tag/171/",
  "lcv": "/rest/v1/tag/172/",
  "outsourcing": "/rest/v1/tag/173/",
  "freespeech": "/rest/v1/tag/174/",
  "bullying": "/rest/v1/tag/175/",
  "doma": "/rest/v1/tag/176/",
  "burma": "/rest/v1/tag/177/",
  "dfa": "/rest/v1/tag/178/",
  "clcv": "/rest/v1/tag/179/",
  "defenders": "/rest/v1/tag/180/",
  "dadt": "/rest/v1/tag/181/",
  "greenpeace": "/rest/v1/tag/182/",
  "medicaid": "/rest/v1/tag/183/",
  "texas": "/rest/v1/tag/184/",
  "water": "/rest/v1/tag/185/",
  "deficit": "/rest/v1/tag/186/",
  "defense": "/rest/v1/tag/187/",
  "spending": "/rest/v1/tag/188/",
  "bushtaxcuts": "/rest/v1/tag/189/",
  "cleanair": "/rest/v1/tag/190/",
  "wilderness": "/rest/v1/tag/191/",
  "truemajority": "/rest/v1/tag/192/",
  "iowa": "/rest/v1/tag/193/",
  "wisconsin": "/rest/v1/tag/194/",
  "thankyou": "/rest/v1/tag/195/",
  "nelson": "/rest/v1/tag/196/",
  "senate": "/rest/v1/tag/197/",
  "att": "/rest/v1/tag/198/",
  "breitbart": "/rest/v1/tag/199/",
  "earthjustice": "/rest/v1/tag/200/",
  "stumbledupon": "/rest/v1/tag/201/",
  "glennbeck": "/rest/v1/tag/202/",
  "maryland": "/rest/v1/tag/203/",
  "obama": "/rest/v1/tag/204/",
  "rightwing": "/rest/v1/tag/205/",
  "ccd": "/rest/v1/tag/206/",
  "piven": "/rest/v1/tag/207/",
  "oreilly": "/rest/v1/tag/208/",
  "rawstory": "/rest/v1/tag/209/",
  "chongandkoster": "/rest/v1/tag/210/",
  "nationalmemo": "/rest/v1/tag/211/",
  "Causes": "/rest/v1/tag/212/",
  "environmental action": "/rest/v1/tag/213/",
  "ran": "/rest/v1/tag/214/",
  "fcc": "/rest/v1/tag/215/",
  "copps": "/rest/v1/tag/216/",
  "jerrybrown": "/rest/v1/tag/217/",
  "methyliodide": "/rest/v1/tag/218/",
  "delay": "/rest/v1/tag/219/",
  "disclose": "/rest/v1/tag/220/",
  "iraq": "/rest/v1/tag/221/",
  "bush": "/rest/v1/tag/222/",
  "salmon": "/rest/v1/tag/223/",
  "labeling": "/rest/v1/tag/224/",
  "judicial": "/rest/v1/tag/225/",
  "voterregistrationact": "/rest/v1/tag/226/",
  "irs": "/rest/v1/tag/227/",
  "ckads": "/rest/v1/tag/228/",
  "upworthy": "/rest/v1/tag/229/",
  "mailing 8622 target": "/rest/v1/tag/230/",
  "actblue_expresslane": "/rest/v1/tag/231/",
  "walmart": "/rest/v1/tag/232/",
  "mixed channel": "/rest/v1/tag/233/",
  "kxl_action_event_host": "/rest/v1/tag/236/",
  "civil liberties": "/rest/v1/tag/237/",
  "ControlShift Category: education": "/rest/v1/tag/238/",
  "oil change international": "/rest/v1/tag/239/",
  "testing_universe": "/rest/v1/tag/240/",
  "deliveries - closed": "/rest/v1/tag/241/",
  "delivery": "/rest/v1/tag/242/",
  "friends_of_the_earth": "/rest/v1/tag/243/",
  "partnership": "/rest/v1/tag/244/",
  "copied for delivery": "/rest/v1/tag/245/",
  "nycc": "/rest/v1/tag/246/",
  "momsdemandaction": "/rest/v1/tag/247/",
  "rhrealitycheck": "/rest/v1/tag/248/",
  "socialsecurityworks": "/rest/v1/tag/249/",
  "takeactionmn": "/rest/v1/tag/250/",
  "boldnebraska": "/rest/v1/tag/251/",
  "350": "/rest/v1/tag/252/",
  "fossilfree": "/rest/v1/tag/253/",
  "MissouriansOrganizingforReformandEmpowerment": "/rest/v1/tag/254/",
  "foodandwaterwatch": "/rest/v1/tag/255/",
  "turtleisland": "/rest/v1/tag/256/",
  "ethicalelectric": "/rest/v1/tag/257/",
  "CenterforCommunityChange": "/rest/v1/tag/258/",
  "berim": "/rest/v1/tag/259/",
  "ALEC": "/rest/v1/tag/260/",
  "medicaid expansion": "/rest/v1/tag/261/",
  "medicaid_expansion": "/rest/v1/tag/262/",
  "minimumwage": "/rest/v1/tag/263/",
  "action network": "/rest/v1/tag/264/",
  "Globalization": "/rest/v1/tag/265/",
  "affiliate": "/rest/v1/tag/266/",
  "day we fight back": "/rest/v1/tag/267/",
  "KansasPeoplesAction": "/rest/v1/tag/268/",
  "mobilize_calls": "/rest/v1/tag/269/",
  "alan grayson": "/rest/v1/tag/270/",
  "scalia": "/rest/v1/tag/271/",
  "Outbrain": "/rest/v1/tag/278/",
  "Taboola": "/rest/v1/tag/279/",
  "reset the net": "/rest/v1/tag/280/",
  "McConnell": "/rest/v1/tag/281/",
  "Gardner": "/rest/v1/tag/282/",
  "AFT": "/rest/v1/tag/283/",
  "Open media": "/rest/v1/tag/284/",
  "donations voters": "/rest/v1/tag/285/",
  "Yes on 92": "/rest/v1/tag/286/",
  "Mobile fundraiser": "/rest/v1/tag/287/",
  "reactivation match": "/rest/v1/tag/288/",
  "credo customer": "/rest/v1/tag/289/",
  "Big Telecom": "/rest/v1/tag/290/",
  "couragecampaign": "/rest/v1/tag/291/"
};