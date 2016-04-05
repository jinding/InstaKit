## InstaKit

InstaKit is a Meteor.js app that simplifies the creation of ActionKit campaigns (pages and mailings) with ShareProgress after-action redirect pages. Abstract away the templates and wrappers and organization-standard requirements, and allow your campaigners to focus solely on the content of the page or mailing. Also automatically generate the mailing for a given page based upon the page content.

<a href="screenshots.md">**View screenshots here**</a>.

You can create AK pages of type:
* petition
* letter
* event

For petition and letter pages, your SP pages will be automatically created and linked up. You can set rules on the server-side for your organization-wide standard requirements (ex: "all pages are set to 'Recognize once', use the 'default' templateset, and be tagged 'awesome sauce') so that the campaigners don't need to remember to do these things.

For event pages, the event campaign will be created as well as any subevents that you might want to set up at the same time. This is primarily geared towards centrally-hosted events.

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
      "actionKitOrgTag": {"name": "credo", "resource_uri": "/rest/v1/tag/32/"}
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

  At the end of the **server/methods.js** file, there are 2 dictionaries hard-coded in: sender and tags. These are used to pull in confirmation email sender and optional page tags.

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

7. Customizations
  * Mailing wrappers
  * Page confirmation email

8. Deploy it

  For free hosting, you can use a combination of free services from Heroku and MongoLab. Here are links to some community articles to help you get started:

   [How to run a MeteorJS application on Heroku in 10 steps](https://medium.com/@leonardykris/how-to-run-a-meteor-js-application-on-heroku-in-10-steps-7aceb12de234?mkt_tok=3RkMMJWWfF9wsRonu6rNZKXonjHpfsX67uQrXqSg38431UFwdcjKPmjr1YIBTsd0aPyQAgobGp5I5FEOSLfYTrZqt6wJWg%3D%3D#.omto8uft5)
   
   [Deploy to production on Heroku](http://justmeteor.com/blog/deploy-to-production-on-heroku/?mkt_tok=3RkMMJWWfF9wsRonu6rNZKXonjHpfsX67uQrXqSg38431UFwdcjKPmjr1YIBTsd0aPyQAgobGp5I5FEOSLfYTrZqt6wJWg%3D%3D)

   You can also consult [the Meteor Guide for other DIY deployment options](http://guide.meteor.com/deployment.html?mkt_tok=3RkMMJWWfF9wsRonu6rNZKXonjHpfsX67uQrXqSg38431UFwdcjKPmjr1YIBTsd0aPyQAgobGp5I5FEOSLfYTrZqt6wJWg%3D%3D).

   For paid hosting (~$12/mo) you can deploy to [Meteor Galaxy](https://www.meteor.com/galaxy/) which supports one-line deployment that will look like this:

  `meteor deploy [your app name].meteorapp.com --settings settings.json`

9. Set up the live app
  
  Go to your deployed app's URL

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

### License

This project is licensed under the terms of the MIT license.
