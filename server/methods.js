
function createShareProgressPage(page) {
	try {
		var sp = HTTP.call('POST', 'https://run.shareprogress.org/api/v1/pages/update',
				{ headers: {'Content-type': 'application/json'},
  				  data: {
					  'key': 'saYLoUzgQUmlYRjyrEhUiQ',
					  'page_url': 'http://act.credoaction.com/sign/'+page.pageName,
					  'page_title': page.pageTitle+' | CREDO Action',
					  'auto_fill': true,
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
			if (sp.data.message && sp.data.message.variants[0])
				throw new Meteor.Error(500, sp.data.message.variants[0], sp);
			else throw new Meteor.Error(500, sp.data.message);
		}
	} catch (e) {
		if (sp.data.message && sp.data.message.variants[0])
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
                      			allow_multiple_responses: true,
                      			fields: { 
                      			 	'image_email_180': page.pageGraphicEmail,
									'image_homepage_100': page.pageGraphicHomePage,
									'image_facebook_114': page.pageGraphicFacebook,
									'taf_facebook_title': page.pageFacebookTitle,
									'taf_facebook_copy': page.pageFacebookCopy,
									'taf_tweet': updateTwitterForAK(page.pageTwitterCopy,bitly)
                      			}, // end fields
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
								tags: [{name: 'credo', resource_uri: '/rest/v1/tag/32/'}],
								type: 'Petition'
                      		} // end data
                      });		
		return true; 
	} catch (e) {
		if (e.response.statusCode === 400)
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
	  var createPageForm = HTTP.call("POST", "https://act.credoaction.com/rest/v1/petitionform/",
	  						 {auth: 'meteor:dingbergalis',
	  						  headers: {'Content-type': 'application/json'},
	                          data: {about_text: page.pageImportAboutText,
	                      			 page: resource,
	                      			 statement_leadin: page.pageImportStatementLeadIn,
	                      			 statement_text: page.pageImportStatementText,
	                      			 thank_you_text: 'thank you'					             
	                      			} // end data
	                      });		
	  console.log(createPageForm.headers.location);
	  return createPageForm.headers.location;
	} catch (e) {
		if (e.response.statusCode === 400)
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
		if (e.response.statusCode === 400)
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
		if (e.response.data.statusCode === 400)
        	throw new Meteor.Error(e.response.data.statusCode, e.response.data.status_txt, e.response);
        else
        	throw new Meteor.Error(500, "Unknown error updating page after-action fields", e.response.data);
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
	  var createPage = HTTP.call("POST", "https://act.credoaction.com/rest/v1/petitionpage/",
	  						 {auth: 'meteor:dingbergalis',
	  						  headers: {'Content-type': 'application/json'},
	                          data: {
	                      			name: page.pageName       
	                      		} // end data
	                      });		
		return createPage.headers.location; 
	} catch (e) {
		console.log(e.response);
		if (e.response.statusCode === 400)
			if (e.response.data && e.response.data.petitionpage && e.response.data.petitionpage.name[0])
	        	throw new Meteor.Error(e.response.statusCode, e.response.data.petitionpage.name[0], e.response);
	        else throw new Meteor.Error(e.response.statusCode, e.response.content, e.response);
        else
        	throw new Meteor.Error(500, "Unknown error creating page", e.response.data);
	}
  },
  populateAKpage: function (page,loc) {
	var sp = createShareProgressPage(page);
	console.log('shareprogress returns ',sp);
  	var bitly = createShortLink(page);
  	console.log('returned by bitly: '+bitly);
  	var AK = HTTP.call('GET', loc, {auth: 'meteor:dingbergalis'}).data;
  	console.log(AK);
  	updatePageShare(page, loc, bitly);
  	updatePageForm(page, AK.resource_uri);
  	updatePageFields(page, AK.resource_uri, sp.share_page_url);
  	var pageObj = {};
  	pageObj.AKpage = 'http://act.credoaction.com/sign/' + page.pageName;
  	pageObj.AKpageEdit = 'https://act.credoaction.com/admin/core/petitionpage/' + AK.id;
  	pageObj.SPpage = sp.share_page_url;
  	pageObj.bitly = bitly;
  	pageObj.pageID = AK.id;
  	pageObj.resource_uri = AK.resource_uri;
  	return pageObj;
  },
  createAKemail: function (email) {
  	console.log(email.headline);
	try {
	  // create new petition page.
	  var createPage = HTTP.call("POST", "https://act.credoaction.com/rest/v1/petitionpage/",
	  						 {auth: 'meteor:dingbergalis',
	  						  headers: {'Content-type': 'application/json'},
	                          data: {title: email.headline,
	                      			 name: email.link,
	                      			 fields: { 'image_email_180': email.graphic },
	                      			 required_fields: [{id: 2,
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
						                               resource_uri: '/rest/v1/formfield/7/'}],
									 tags: [{name: 'credo', resource_uri: '/rest/v1/tag/32/'}]						             
	                      			} // end data
	                      });		
	  console.log(createPage.headers.location);
	  // find out where this petition got created and get its resource_uri. not sure if this is efficient way to do this.
	  var getPetitionPageId = HTTP.call("GET", createPage.headers.location,
	  						  {auth: 'meteor:dingbergalis'});
	  console.log(getPetitionPageId.data.resource_uri);
	  // create the petition cms form and set its page to the petition page resource_uri.
	  // doing this automatically updates the petition page to find this form
	  var createPageForm = HTTP.call("POST", "https://act.credoaction.com/rest/v1/petitionform/",
	  						 {auth: 'meteor:dingbergalis',
	  						  headers: {'Content-type': 'application/json'},
	                          data: {about_text: email.markdown_data,
	                      			 page: getPetitionPageId.data.resource_uri,
	                      			 statement_leadin: email.statement_leadin,
	                      			 statement_text: email.petition,
	                      			 thank_you_text: 'thank you'					             
	                      			} // end data
	                      });		
	  console.log(createPageForm);

	  // NEXT STEPS: show button for only petitions
	  // Error handling- what if page name is already taken?
	  // Should we update or create new page?
	  // what if there is no petition text?  this might throw an error
	  // also need to figure out how to spit out html instead of markdown for email body
	  // create a petition page type and also be able to push that to an email


/*	this doesn't work when creating an email. not as useful anyway.  
	var result = HTTP.call("POST", "https://act.credoaction.com/rest/v1/mailing/",
	  						 {auth: 'meteor:dingbergalis',
	  						  headers: {'Content-type': 'application/json'},
	                          data: {subjects: [{text: email.headline}],
	                      			 users: 30}
	                      });
*/

	  return true;
	} catch (e) {
		// assume it was a 4xx or 5xx error.  really need to watch for other kinds of errors.
		console.log(e.response);
	  // Got a network error, time-out or HTTP error in the 400 or 500 range.
	  return false;
  	}
  }
});

/*  	console.log(page.pageTitle);
  	console.log(page.pageName);
  	console.log(page.pageStatementLeadIn);
  	console.log(page.pageStatementText);
  	console.log(page.pageAboutText);
  	console.log(page.pageGraphicEmail);
  	console.log(page.pageGraphicFacebook);
  	console.log(page.pageGraphicHomePage);
  	console.log(page.pageSharePageLink);
  	console.log(page.pageTAFSL);
  	console.log(page.pageTAFCopy);
  	console.log(page.pageFacebookTitle);
  	console.log(page.pageFacebookCopy);
  	console.log(page.pageTwitterCopy);
  	console.log(page.pageConfEmailSL);
  	console.log(page.pageConfEmailBody);
  */

  /*
  createAKpage: function (page) {
	try {
	  // create new petition page.
	  var createPage = HTTP.call("POST", "https://act.credoaction.com/rest/v1/petitionpage/",
	  						 {auth: 'meteor:dingbergalis',
	  						  headers: {'Content-type': 'application/json'},
	                          data: {
	                      			name: page.pageName,		                      			 
	                      			title: page.pageTitle,
	                      			allow_multiple_responses: true,
	                      			fields: { 
	                      			 	'image_email_180': page.pageGraphicEmail,
										'image_homepage_100': page.pageGraphicHomePage,
										'image_facebook_114': page.pageGraphicFacebook,
										'taf_facebook_title': page.pageFacebookTitle,
										'taf_facebook_copy': page.pageFacebookCopy,
										'taf_tweet': page.pageTwitterCopy
	                      			}, // end fields
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
									tags: [{name: 'credo', resource_uri: '/rest/v1/tag/32/'}],
									type: 'Petition'		             
	                      		} // end data
	                      });		
	  console.log(createPage.headers.location);
	  // find out where this petition got created and get its resource_uri. not sure if this is efficient way to do this.
	  var getPetitionPageId = HTTP.call("GET", createPage.headers.location, {auth: 'meteor:dingbergalis'});
	  updatePageForm(page,getPetitionPageId);
	  updatePageFields(page,getPetitionPageId);
	  return true;
	} catch (e) {
		// assume it was a 4xx or 5xx error.  really need to watch for other kinds of errors.
		console.log(e.response.statusCode);
		console.log(e.response);
	  // Got a network error, time-out or HTTP error in the 400 or 500 range.
	  return false;
  	}
  },
  */
