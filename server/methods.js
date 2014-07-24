function createShareProgressPage(page) {
	try {
		var sp = HTTP.call('POST', 'https://run.shareprogress.org/api/v1/pages/update',
				{ headers: {'Content-type': 'application/json'},
  				  data: {
					  'key': 'saYLoUzgQUmlYRjyrEhUiQ',
					  'page_url': 'http://act.credoaction.com/sign/'+page.pageName,
					  'page_title': page.pageTitle+' | CREDO Action',
					  'variants': {
					  	'facebook': [{ facebook_title: page.pageFacebookTitle,
					  					facebook_description: page.pageFacebookCopy,
					  					facebook_thumbnail: page.pageGraphicFacebook }],
					  	'email': 	[{ email_subject: page.pageTAFSL,
					  			 		email_body: page.pageTAFCopy }],
					  	'twitter': [{ twitter_message: page.pageTwitterCopy }]
					} // end variants
				  } // end data
				}); // end HTTP
		console.log('ShareProgress page creation successful? ' + sp.data.success);
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
		else throw new Meteor.Error(500, 'Error creating share page');
	}
}

function updateTwitterForAK(str, bitly) {
	return str.replace(/{ *LINK *}/i, bitly);
}

function updateTAFCopyForAK(str) {
	return str.replace(/{ *LINK *}/i, '{{ page.canonical_url }}');
}

function updatePageShare(page, loc, bitly) {
	// create new petition page.
	try {
		var updatePage = HTTP.call("PUT", loc,
						 {auth: 'meteor:dingbergalis',
  						  headers: {'Content-type': 'application/json'},
                          data: {
                      			name: page.pageName,
                      			title: page.pageTitle,
                      			allow_multiple_responses: false,
                      			fields: { 
                      			 	'image_email_180': page.pageGraphicEmail,
									'image_homepage_100': page.pageGraphicHomePage,
									'image_facebook_114': page.pageGraphicFacebook,
									'taf_facebook_title': page.pageFacebookTitle,
									'taf_facebook_copy': page.pageFacebookCopy,
									'taf_tweet': updateTwitterForAK(page.pageTwitterCopy,bitly)
                      			}, // end fields
                      			one_click: true,
                      			recognize: 'once',
                      			required_fields: [
                      			 	{   id: 2,
										name: 'zip',
										resource_uri: '/rest/v1/formfield/2/'},
									{   id: 3,
									    name: 'address1',
									    resource_uri: '/rest/v1/formfield/3/'},
									{   id: 6,
									    name: 'first_name',
									    resource_uri: '/rest/v1/formfield/6/'},
									{   id: 7,
									    name: 'last_name',
									    resource_uri: '/rest/v1/formfield/7/'}
								], // end required_fields
								tags: [{name: 'credo', resource_uri: '/rest/v1/tag/32/'}]
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

function updatePageForm(page,resource) {
	// create the petition cms form and set its page to the petition page resource_uri.
	// doing this automatically updates the petition page to find this form
	try {
	  console.log('in updatePageForm '+resource);
	  if (page.pageType === 'letter')
		  var createPageForm = HTTP.call("POST", "https://act.credoaction.com/rest/v1/letterform/",
		  						 {auth: 'meteor:dingbergalis',
		  						  headers: {'Content-type': 'application/json'},
		                          data: {about_text: page.pageImportAboutText, // "Import" text is HTML version
		                      			 page: resource,
		                      			 statement_leadin: page.pageImportStatementLeadIn, 
		                      			 letter_text: page.pageStatementText, // letter_text does not take HTML
		                      			 thank_you_text: 'thank you'					             
		                      			} // end data
		                      });		
	  else var createPageForm = HTTP.call("POST", "https://act.credoaction.com/rest/v1/petitionform/",
	  						 {auth: 'meteor:dingbergalis',
	  						  headers: {'Content-type': 'application/json'},
	                          data: {about_text: page.pageImportAboutText, // "Import" text is HTML version
	                      			 page: resource,
	                      			 statement_leadin: page.pageImportStatementLeadIn,
	                      			 statement_text: page.pageImportStatementText, // push in HTML version of text
	                      			 thank_you_text: 'thank you'					             
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

function updatePageFields(page,resource,sp) {
	try {
	  console.log('in updatePageFields '+resource);
	  var addPageFields = HTTP.call("POST", 'https://act.credoaction.com/rest/v1/pagefollowup/',
	  							{auth: 'meteor:dingbergalis',
	  							 headers: {'Content-type': 'application/json'},
	  							 data: {
	                      			page: resource,
                      			 	email_body: page.pageImportConfEmailBody,
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

function createShortLink(page) {
	try {
		var bitly = HTTP.call("GET", 'https://api-ssl.bitly.com/v3/shorten',
					{
		  				params: {
							access_token: '466eb20f1f095be8eb935f7c6fdfbc649c2655fc',
		  					longUrl: 'http://act.credoaction.com/sign/'+page.pageName+'/?source=tw1'
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

function updatePageShareForCreatedPage(page, loc, bitly) {
	// update petition page that already exists in AK
	try {
		var updatePage = HTTP.call("PUT", loc,
						 {auth: 'meteor:dingbergalis',
  						  headers: {'Content-type': 'application/json'},
                          data: {
                      			name: page.pageName,
                      			title: page.pageTitle,
                      			allow_multiple_responses: false,
                      			fields: { 
                      			 	'image_email_180': page.pageGraphicEmail,
									'image_homepage_100': page.pageGraphicHomePage,
									'image_facebook_114': page.pageGraphicFacebook,
									'taf_facebook_title': page.pageFacebookTitle,
									'taf_facebook_copy': page.pageFacebookCopy,
									'taf_tweet': updateTwitterForAK(page.pageTwitterCopy,bitly)
                      			}, // end fields
                      			one_click: true,
                      			recognize: 'once',
                      			required_fields: [
                      			 	{   id: 2,
										name: 'zip',
										resource_uri: '/rest/v1/formfield/2/'},
									{   id: 3,
									    name: 'address1',
									    resource_uri: '/rest/v1/formfield/3/'},
									{   id: 6,
									    name: 'first_name',
									    resource_uri: '/rest/v1/formfield/6/'},
									{   id: 7,
									    name: 'last_name',
									    resource_uri: '/rest/v1/formfield/7/'}
								], // end required_fields
								tags: [{name: 'credo', resource_uri: '/rest/v1/tag/32/'}]
                      		} // end data
                      });		
		return true; 
	} catch (e) {
		console.log('error in updatePageShareForCreatedPage');
		console.log(e.response);
		if (e.response.statusCode && e.response.statusCode === 400)
        	throw new Meteor.Error(e.response.statusCode, e.response.content, e.response);
        else
        	throw new Meteor.Error(500, "Unknown error updating page share fields for previously created page", e.response.data);
	}
};

function updatePageFormForCreatedPage(page,loc) {
	// create the petition cms form and set its page to the petition page resource_uri.
	// doing this automatically updates the petition page to find this form
	try {
	  console.log('in updatePageFormForCreatedPage form uri '+loc);
	  if (page.pageType === 'letter')
	  	var updatePageForm = HTTP.call("PUT", loc,
	  						 {auth: 'meteor:dingbergalis',
	  						  headers: {'Content-type': 'application/json'},
	                          data: {about_text: page.pageImportAboutText,
	                      			 page: page.AKpageResourceURI,
	                      			 statement_leadin: page.pageImportStatementLeadIn,
	                      			 letter_text: page.pageStatementText, // no HTML for letter_text	             
	                      			 thank_you_text: 'thank you'
	                      			} // end data
	                     	 });		
	  else var updatePageForm = HTTP.call("PUT", loc,
	  						 {auth: 'meteor:dingbergalis',
	  						  headers: {'Content-type': 'application/json'},
	                          data: {about_text: page.pageImportAboutText,
	                      			 page: page.AKpageResourceURI,
	                      			 statement_leadin: page.pageImportStatementLeadIn,
	                      			 statement_text: page.pageImportStatementText,			             
	                      			 thank_you_text: 'thank you'
	                      			} // end data
	                     	 });		
	  return true;
	} catch (e) {
		console.log('error in updatePageFormForCreatedPage');
		console.log(e.response);
		if (e.response.statusCode && e.response.statusCode === 400)
        	throw new Meteor.Error(e.response.statusCode, e.response.content, e.response);
        else
        	throw new Meteor.Error(500, "Unknown error updating page form for created page", e.response.data);
  	}
};

function updatePageFieldsForCreatedPage(page,loc,sp) {
	try {
	  console.log('in updatePageFieldsForCreatedPage '+loc);
	  var updatePageFields = HTTP.call("PUT", loc,
	  							{auth: 'meteor:dingbergalis',
	  							 headers: {'Content-type': 'application/json'},
	  							 data: {
	                      			page: page.AKpageResourceURI,
                      			 	email_body: page.pageImportConfEmailBody,
                      			 	email_subject: page.pageConfEmailSL,
                      			 	taf_body: updateTAFCopyForAK(page.pageTAFCopy),
                      			 	taf_subject: page.pageTAFSL,
                      			 	url: sp
	  							 } // end data
	  							} // end auth
	  						);
	  return true;
	} catch (e) {
		console.log('error in updatePageFieldsForCreatedPage');
		console.log(e.response);
		if (e.response.statusCode && e.response.statusCode === 400)
        	throw new Meteor.Error(e.response.statusCode, e.response.content, e.response);
        else
        	throw new Meteor.Error(500, "Unknown error updating page after-action fields for created page", e.response.data);
  	}
};

function updateShareProgressPageForCreatedPage(page) {
	try {
		var loc = page.pageSharePageLink.replace('http://share.credoaction.com/4/','');
		console.log('in updateShareProgressPageForCreatedPage ' + loc);
		var res = HTTP.call('GET', 'https://run.shareprogress.org/api/v1/pages/read',
				{ headers: {'Content-type': 'application/json'},
				  data: {
				  	id: loc,
					'key': 'saYLoUzgQUmlYRjyrEhUiQ'
				  }
				}); // end GET
		var variants = res.data.response[0].variants;
		var sp = HTTP.call('POST', 'https://run.shareprogress.org/api/v1/pages/update',
				{ headers: {'Content-type': 'application/json'},
  				  data: {
  				  	  id: loc,
					  'key': 'saYLoUzgQUmlYRjyrEhUiQ',
					  'page_url': 'http://act.credoaction.com/sign/'+page.pageName,
					  'page_title': page.pageTitle+' | CREDO Action',
					  'auto_fill': true,
					  'variants': {
					  	'facebook': [{  id: variants.facebook[0].id,
					  					facebook_title: page.pageFacebookTitle,
					  					facebook_description: page.pageFacebookCopy,
					  					facebook_thumbnail: page.pageGraphicFacebook }],
					  	'email': 	[{  id: variants.email[0].id,
					  					email_subject: page.pageTAFSL,
					  			 		email_body: page.pageTAFCopy }],
					  	'twitter': [{   id: variants.twitter[0].id,
					  					twitter_message: page.pageTwitterCopy }]
					} // end variants
				  } // end data
				}); // end HTTP
		console.log('ShareProgress page creation successful? ' + sp.data.success);
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
		else throw new Meteor.Error(500, 'Error creating share page');
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
		if (page.pageType === 'letter') 
			var createPage = HTTP.call("POST", "https://act.credoaction.com/rest/v1/letterpage/",
	  						 {auth: 'meteor:dingbergalis',
	  						  headers: {'Content-type': 'application/json'},
	                          data: {
	                      			name: page.pageName       
	                      		} // end data
	                      });
		else var createPage = HTTP.call("POST", "https://act.credoaction.com/rest/v1/petitionpage/",
	  						 {auth: 'meteor:dingbergalis',
	  						  headers: {'Content-type': 'application/json'},
	                          data: {
	                      			name: page.pageName       
	                      		} // end data
	                      });		
		return createPage.headers.location; 
	} catch (e) {
		console.log(e.response);
		if (e.response.statusCode && e.response.statusCode === 400)
			if (e.response.data && e.response.data.petitionpage && e.response.data.petitionpage.name[0])
	        	throw new Meteor.Error(e.response.statusCode, e.response.data.petitionpage.name[0], e.response);
	        else throw new Meteor.Error(e.response.statusCode, e.response.content, e.response);
        else
        	throw new Meteor.Error(500, "Unknown error creating page", e.response.data);
	}
  },
  populateAKpage: function (page,loc) {
  	var bitly = createShortLink(page);
  	console.log('returned by bitly: '+bitly);
  	var AK = HTTP.call('GET', loc, {auth: 'meteor:dingbergalis'}).data;
  	console.log(AK);
  	updatePageShare(page, loc, bitly);
  	updatePageForm(page, AK.resource_uri);
	var sp = createShareProgressPage(page);
	console.log('shareprogress returns ',sp);
  	updatePageFields(page, AK.resource_uri, sp.share_page_url);
  	var pageObj = {};
  	pageObj.AKpage = 'http://act.credoaction.com/sign/' + page.pageName;
  	if (page.pageType === 'letter') 
  		pageObj.AKpageEdit = 'https://act.credoaction.com/admin/core/letterpage/' + AK.id;
  	else pageObj.AKpageEdit = 'https://act.credoaction.com/admin/core/petitionpage/' + AK.id;
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
		var loc = 'https://act.credoaction.com'+page.AKpageResourceURI;
		console.log('page resource URI: '+ loc);

		// update new bitly link in case page short name was edited
	  	var bitly = createShortLink(page);
	  	console.log('returned by bitly: '+bitly);

	  	// overwrite page title, name and custom fields
	  	// eventually need to check for error that updated page name conflicts with another page in AK
		updatePageShareForCreatedPage(page, loc, bitly);

		// get resource_uris for page fields and page form
	  	var AK = HTTP.call('GET', loc, {auth: 'meteor:dingbergalis'}).data;
	  	var cmsForm = AK.cms_form;
	  	var followupPageFields = AK.followup.resource_uri;

		// modify SP page
		var sp = updateShareProgressPageForCreatedPage(page);
		console.log('shareprogress returns ',sp.share_page_url);

	  	updatePageFormForCreatedPage(page, 'https://act.credoaction.com'+cmsForm);
	  	updatePageFieldsForCreatedPage(page, 'https://act.credoaction.com'+followupPageFields, sp.share_page_url);

	  	var pageObj = {};
	  	pageObj.AKpage = 'http://act.credoaction.com/sign/' + page.pageName;
	  	if (page.pageType === 'letter') 
	  		pageObj.AKpageEdit = 'https://act.credoaction.com/admin/core/letterpage/' + page.AKpageID;
	  	else pageObj.AKpageEdit = 'https://act.credoaction.com/admin/core/petitionpage/' + page.AKpageID;
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
  		var createEventUmbrella = HTTP.call("POST", "https://act.credoaction.com/rest/v1/campaign/",
	  						 {auth: 'meteor:dingbergalis',
	  						  headers: {'Content-type': 'application/json'},
	                          data: {
	                      			name: eventUmbrella.pageName,
	                      			title: eventUmbrella.pageTitle,
	                      			default_event_size: eventUmbrella.eventDefaultSize,
	                      			max_event_size: "2500",
	                      			default_title: eventUmbrella.eventDefaultTitle,
	                      			public_create_page: false,
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
  		var eventUmbrellaURI = loc.replace('https://act.credoaction.com','');

  		console.log(eventUmbrellaURI);

  		// REMEMBER TO CHANGE THIS BACK TO CREDO FROM ROBOTIC DOGS AND USER AUTH
  		var createEventHostPage = HTTP.call("POST", "https://act.credoaction.com/rest/v1/eventcreatepage/",
	  						 {auth: 'meteor:dingbergalis',
	  						  headers: {'Content-type': 'application/json'},
	                          data: {
	                          		campaign: eventUmbrellaURI,
	                          		list: "/rest/v1/campaign/1/",
	                      			name: eventUmbrella.pageName + "_host",
	                      			title: eventUmbrella.pageTitle + " - Host",
	                      			required_fields: [
	                      			 	{   id: 2,
											name: 'zip',
											resource_uri: '/rest/v1/formfield/2/'},
										{   id: 3,
										    name: 'address1',
										    resource_uri: '/rest/v1/formfield/3/'},
										{   id: 6,
										    name: 'first_name',
										    resource_uri: '/rest/v1/formfield/6/'},
										{   id: 7,
										    name: 'last_name',
										    resource_uri: '/rest/v1/formfield/7/'}
									], // end required_fields
	                      		} // end data
	                      });
  		console.log("eventHost URL " + createEventHostPage.headers.location);
 		var eventHostURL = createEventHostPage.headers.location.replace('https://act.credoaction.com','');
  		var createEventHostForm = HTTP.call("POST", "https://act.credoaction.com/rest/v1/eventcreateform/",
	  						 {auth: 'meteor:dingbergalis',
	  						  headers: {'Content-type': 'application/json'},
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
  		var eventUmbrellaURI = eventUmbrella.eventUmbrellaCampaignURL.replace('https://act.credoaction.com','');

  		console.log(eventUmbrellaURI);
  		
  		// REMEMBER TO CHANGE THIS BACK TO CREDO FROM ROBOTIC DOGS AND USER AUTH
  		var createEventSignupPage = HTTP.call("POST", "https://act.credoaction.com/rest/v1/eventsignuppage/",
	  						 {auth: 'meteor:dingbergalis',
	  						  headers: {'Content-type': 'application/json'},
	                          data: {
	                          		campaign: eventUmbrellaURI,
	                          		list: "/rest/v1/campaign/1/",
	                      			name: eventUmbrella.pageName + "_attend",
	                      			title: eventUmbrella.pageTitle + " - Attend",
	                      			required_fields: [
	                      			 	{   id: 2,
											name: 'zip',
											resource_uri: '/rest/v1/formfield/2/'},
										{   id: 3,
										    name: 'address1',
										    resource_uri: '/rest/v1/formfield/3/'},
										{   id: 6,
										    name: 'first_name',
										    resource_uri: '/rest/v1/formfield/6/'},
										{   id: 7,
										    name: 'last_name',
										    resource_uri: '/rest/v1/formfield/7/'}
									], // end required_fields
	                      		} // end data
	                      });
  		console.log("eventSignup URL " + createEventSignupPage.headers.location);
  		var eventSignupURL = createEventSignupPage.headers.location.replace('https://act.credoaction.com','');
  		var createEventSignupForm = HTTP.call("POST", "https://act.credoaction.com/rest/v1/eventsignupform/",
	  						 {auth: 'meteor:dingbergalis',
	  						  headers: {'Content-type': 'application/json'},
	                          data: {
	                          		page: eventSignupURL,
//	                          		signup_text: "Signup for our event!",
	                          		thank_you_text: "Thanks for signing up"
	                      		} // end data
	                      });
	    console.log("eventSignupForm URL " + createEventSignupForm.headers.location);

		var addPageFields = HTTP.call("POST", 'https://act.credoaction.com/rest/v1/pagefollowup/',
									{auth: 'meteor:dingbergalis',
									 headers: {'Content-type': 'application/json'},
									 data: {
		                  			page: eventSignupURL,
		              			 	email_body: eventUmbrella.pageImportConfEmailBody,
		              			 	email_subject: eventUmbrella.pageConfEmailSL,
		              			 	send_email: true,
		              			 	send_taf: true,
//		              			 	taf_body: updateTAFCopyForAK(page.pageTAFCopy),
//		              			 	taf_subject: page.pageTAFSL,
		              			 	url: '/cms/thanks/'+eventUmbrella.pageName+'_attend'
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
  		// REMEMBER TO CHANGE THIS BACK TO CREDO FROM ROBOTIC DOGS AND USER AUTH
  		var eventUmbrellaURI = subEvent.eventUmbrellaCampaignURL.replace('https://act.credoaction.com','');

		var host = HTTP.call('GET', 
			'https://act.credoaction.com/rest/v1/user/?email=' + subEvent.subEventHostEmail,
			{auth: 'meteor:dingbergalis'}).data;

		console.log(host.objects[0].resource_uri);  

  		// REMEMBER TO CHANGE THIS BACK TO CREDO FROM ROBOTIC DOGS AND USER AUTH
  		var createSubEvent = HTTP.call("POST", "https://act.credoaction.com/rest/v1/event/",
	  						 {auth: 'meteor:dingbergalis',
	  						  headers: {'Content-type': 'application/json'},
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
  		console.log('event: ' + createSubEvent.headers.location.replace('https://act.credoaction.com',''));
  		console.log('page: ' + subEvent.eventUmbrellaHostURL.replace('https://act.credoaction.com',''));

  		var createHostSignup = HTTP.call("POST", "https://act.credoaction.com/rest/v1/eventsignup/",
	  						 {auth: 'meteor:dingbergalis',
	  						  headers: {'Content-type': 'application/json'},
	                          data: {
	                          		event: createSubEvent.headers.location.replace('https://act.credoaction.com',''),
	                          		page: subEvent.eventUmbrellaHostURL.replace('https://act.credoaction.com',''),
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

