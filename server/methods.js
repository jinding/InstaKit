function updatePageFields(page,getPetitionPageId) {
	try {
	  var addPageFields = HTTP.call("POST", 'https://act.credoaction.com/rest/v1/pagefollowup/',
	  							{auth: 'meteor:dingbergalis',
	  							 headers: {'Content-type': 'application/json'},
	  							 data: {
	                      			page: getPetitionPageId.data.resource_uri,
                      			 	email_body: page.pageConfEmailBody,
                      			 	email_subject: page.pageConfEmailSL,
                      			 	send_email: true,
                      			 	send_taf: true,
                      			 	taf_body: page.pageTAFCopy,
                      			 	taf_subject: page.pageTAFSL,
                      			 	url: page.pageSharePageLink
	  							 } // end data
	  							} // end auth
	  						);
	  console.log(addPageFields.headers.location);
	  return true;
	} catch (e) {
		// assume it was a 4xx or 5xx error.  really need to watch for other kinds of errors.
		console.log(e.response);
	  // Got a network error, time-out or HTTP error in the 400 or 500 range.
	  return false;
  	}
}

function updatePageForm(page,getPetitionPageId) {
	// create the petition cms form and set its page to the petition page resource_uri.
	// doing this automatically updates the petition page to find this form
	try {
		console.log('in updatePageForm '+getPetitionPageId.data.resource_uri);
	  var createPageForm = HTTP.call("POST", "https://act.credoaction.com/rest/v1/petitionform/",
	  						 {auth: 'meteor:dingbergalis',
	  						  headers: {'Content-type': 'application/json'},
	                          data: {about_text: page.pageAboutText,
	                      			 page: getPetitionPageId.data.resource_uri,
	                      			 statement_leadin: page.pageStatementLeadIn,
	                      			 statement_text: page.pageStatementText,
	                      			 thank_you_text: 'thank you'					             
	                      			} // end data
	                      });		
	  console.log(createPageForm.headers.location);
	  return true;
	} catch (e) {
		// assume it was a 4xx or 5xx error.  really need to watch for other kinds of errors.
		console.log(e.response);
	  // Got a network error, time-out or HTTP error in the 400 or 500 range.
	  return false;
  	}
}


Meteor.methods({
  saveFile: function (resp) {
    resp.when = new Date;
    return Files.upsert(resp.id, resp);
  },
  createAKpage: function (page) {
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
		console.log(e.response);
	  // Got a network error, time-out or HTTP error in the 400 or 500 range.
	  return false;
  	}
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