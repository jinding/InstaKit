## InstaKit

A Meteor.js app that simplifies the creation of ActionKit campaigns with ShareProgress after-action redirect pages.

This allows you to create AK pages of type:
* petition
* letter
* event

For petition and letter pages, your SP pages will be automatically created and linked up.

Event pages use the standard /thanks template in your AK instance. The event campaign will be created as well as the any subevents that you might want to set up at the same time. This is primarily geared towards centrally-hosted events

This app also allows you to copy the campaign data of title, URL, petition text, about text and images into a mailing so that you can copy the HTML and paste it into an AK mailing.

You can also create standalone mailings of whichever templates you’ve defined in the app. This ships with a “blank” and a generic “petition” template.

### Before you start

This app uses Google authentication, which means it assumes you have a Google apps account with the same domain for all users accessing this app. You would edit that domain in the settings.json file (below) and set it for “emailDomain”.

Set up a bitly account if you don’t already have one. You can get the generic access token for the settings file here: https://bitly.com/a/oauth_apps

It has been built for CREDO’s needs, which may not be the same as your organizations’. For example, we tag all of our pages, we use custom page fields for social sharing (because this was built way before AK built in social), we have special wrappers and stuff.

### Installation

1. Install Meteor
	
  Follow the instructions here: https://www.meteor.com/install

2. Set organization-specific variables in **settings.json**

  Create a new file called **settings.json** in the main app folder. Update the JSON below with the authorization tokens and URLs specific to your organization, then save that in **settings.json**. Note that this is in **.gitignore** so it won’t be checked in with the rest of the repo. 

  ``` javascript
  {
    "actionKitApi": {
      "actionKitAuth": "username:password",
      "actionKitUrl": "https://act.credoaction.com/",
      "actionKitOrgTag": [{"name": "credo", "resource_uri": "/rest/v1/tag/32/"}]
    },
    "shareProgressApi": {
      "shareProgressApiUrl": "https://run.shareprogress.org/api/v1/",
      "key": "1234asdf5678ghjk890",
      "shareProgressUrl": "http://share.credoaction.com/4/",
      "actionKitUrl": "http://act.credoaction.com/sign/"
    },
    "bitlyApi": {
      "access_token": "0987lkjh6543gfds321dsa123fgj4567",
      "longUrl": "http://act.credoaction.com/sign/"
    },
    "orgName": "CREDO Action",
    "emailDomain": "credoaction.com",
    "public": {
      "admins": ["Jin Ding"]
    }
  }
  ```

3. Run it locally

  In the terminal:

  ```
  cd [your app folder]
  meteor run --settings settings.json
  ```

4. Set up Google authentication

  Go to <http://localhost:3000/>

	Click on “Configure Google”

  Follow the instructions to get your client ID and secret key

  (note that this only applies to localhost:3000 -- when you deploy you’ll need to do the same thing for your production URL)

  #### ( Okay, PAUSE. Did you get in? Can you tab around the different pages? Can you save a page or mailing and it shows up in the list of pages / mailings? -- but don’t try pushing any pages to ActionKit yet. If you can’t do any of these, stop here and try to fix that first. )

5. Update dictionaries

  At the end of the **meteor.js** file, there are 2 dictionaries hard-coded in: sender and tags. These are used to pull in confirmation email sender and optional page tags.

  They’re formatted like this:

  ``` javascript
  var senderDictionary = {
  	"CREDO Action": "/rest/v1/fromline/[fromline ID]/",
  	"CREDO SuperPAC": "/rest/v1/fromline/[fromline ID]/"
  };

  var tagDictionary = {
    "environment": "/rest/v1/tag/[tag ID]/",
    "financial": "/rest/v1/tag/[tag ID]/"
  };
  ```
  Just update them with the values for your own AK instance.

  Next you’ll need to update which tags show up as options when creating a page. Edit this section in **createPageInputTemplates.html** with the names of the tags:

  ``` javascript
  <template name="templatePageTags">
  	<div class="bodytext">
  		<div class="bodytext_desc">Tags</div>
  		<table width="496">
  		<tr>
  			<td>
  				{{{tagCheckbox 'economic'}}}<br>
  				{{{tagCheckbox 'financial'}}}<br>
  				{{{tagCheckbox 'labor'}}}<br>
  				{{{tagCheckbox 'civilrights'}}}<br>
  				{{{tagCheckbox 'immigration'}}}<br>
  				{{{tagCheckbox 'race'}}}<br>
  				{{{tagCheckbox 'voting'}}}<br>
  				{{{tagCheckbox 'lgbt'}}}
  			</td>
  		</tr>
  		</table>
  	</div>
  </template>
  ```

6. Test the configuration

  Go to /pages.

  Create a new page of any type.

  Make sure you have the console inspector open, then click on “push to AK”.

  If you get errors, you might get more information in the console or in the terminal.

6. Customizations
  * Mailing wrappers
  * Page confirmation email

7. Deploy it

  `meteor deploy [pick a name].meteor.com --settings settings.json`

  Go to [pick a name].meteor.com

  Log in
  
  Set up the Google configuration
  
  Done!
  
### Notes

Meteor live-updates the browser, so no refresh needed to see the changes you’ve made. If you look at the terminal after you hit save, you’ll see it say something like: “=> Client modified -- refreshing (x9)” (or an error if you had a typo in your code). But if all goes well then you can just see the browser update automagically with your changes.

Defaults to showing you only the pages and mailings that you have created or saved.

Only displays the last 3 months’ worth of pages and mailings

### Meteor resources

[Official documentation](http://docs.meteor.com/#/full/quickstart)

[Discover Meteor book](https://www.discovermeteor.com/)

[StackOverflow](https://stackoverflow.com/questions/tagged/meteor)
