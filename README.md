[![Build Status](https://travis-ci.org/produle/usercomio.svg?branch=master)](https://travis-ci.org/produle/usercomio)

# UserCom
A Open-Source platform to track, engage and convert users of your application, record events performed by them to improve usability with the help of reported metrics.

## Requirements
 - NodeJS v4.6+ [[Installation Guide](https://nodejs.org/en/download/package-manager/)]
 - MongoDB v2.2+ [[Installation Guide](https://docs.mongodb.com/manual/installation/)]
 
## Installation
Run the below commands to install the dependencies
```
cd path/to/application/root /* Change to application root directory */
npm install
```

## Run
To run the application, execute the following commands
```
cd path/to/application/root /* Change to application root directory */
sudo mongod  /* This will start mongodb server with default port 27017 */
npm run dev /* Starts the usercom application in development mode at port 3000 */
npm run prod /* Starts the usercom application in production mode at port 3000 */
```

## Setup
1. Goto `http://localhost:3000/setup` for the setup process.
2. Fill in the Database, SMTP Email, Admin User and Basic settings in the wizard.
3. Once setup is completed, you can login at `http://localhost:3000/login`.

## Create AppID in Usercom
1. Login to Usercom.
2. Click the dropdown menu at top-right corner, near the name and click the gear icon next to the application.
3. A popup will appear with the App details.

## Using the trackingcode
1. Copy the file `WebContent/js/src/internal/tracking/track.js` to your application.
2. Include the below snippets in your application to start recording the visitors.
    
    ```
    <script type="text/javascript" src="{includepath}/track.js"></script>
    <script>
    Usercom.init('{appID}',{ /* appID generated from the usercom application */
        name: "Jane Doe",   /* Fullname of the visitor */
        email: "janedoe@example.com",   /* Email Address of the visitor */
        created_at: 1312182000, /* Current timestamp */
        paid: true, /* Boolean */
        birthdate: "1990-01-01", /* Date in format YYYY-MM-DD */
        gender: "male", /* possible values ("male","female","other") */
        profilepicture: "", /* a valid profile picture url */
        rating:'5'  /* Sample Custom Data */
    })
    </script>
    ```
    
## Process for Grunt build   
 Navigate to the project root folder and execute   
 grunt /*grunt to execute the default function inside gruntfile.js*/
 
## Auto Build Process using Grunt and Travis CI
1. Go to the travis-ci.org website and signup.
2. Authorize the repository you want to get access. 
3. Create a github token for the project repository and add it in the travis ci Environment Variables *More Options > Settings* with keyname as *GH_TOKEN*.
4. Add Travis CI service in the git repository *Interactions and Services*. 
5. Copy the markdown url from the travis-ci project and place it inside the README.md file to update the build status in the git repository.
6. Travis builds the code and pushes the minified code to the git source while pushing the changes.

    
## Copyright and license

Copyright © 2008-2017 A Produle Systems Pvt Ltd. www.produle.com. All rights reserved. This project is released under the Apache 2.0 license. UserCom.io and usercomio names belong to 'A Produle Systems Pvt Ltd'
