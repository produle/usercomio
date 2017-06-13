[![Build Status](https://travis-ci.org/produle/usercomio.svg?branch=master)](https://travis-ci.org/produle/usercomio)

# UserCom.io
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

## Using the trackingcode in your application
1. Login to Usercom.
2. Click the dropdown menu at top-right corner, near the name and click the gear icon next to your app name.
3. A popup will appear with the script required to track users from your application.
4. Copy and paste the tracking code in your application to trigger a session.
5. You can also add any number of custom data which can later be used for analysis.
6. The generated script would be similar to the following
    
    ```
    <script type="text/javascript" src="{serverpath}/tracking/track.js?appid={appID}"></script>
    <script>
    Usercom.init({
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
    
## Email Notification
Email settings can be saved in `Edit Email Settings`, which is available in the top-right corner dropdown. You can send emails through any of the following interfaces:
1. SMTP
2. [Mailgun](https://www.mailgun.com/)
3. [Amazon SES](https://aws.amazon.com/ses/)

## Browser Notification
You can send browser notifications to multiple users through Usercom, by completing the setup process as follows:
1. Login to the [Firebase Console](https://console.firebase.google.com), and create a `New Project`. The project name is used as `FCM App Name` in Usercom.
2. Goto `Project Settings`, select the `Cloud Messaging` tab. `Server key` is your `FCM Secret Key` and `Sender ID` is your `FCM Sender ID` in Usercom.
3. Enter the above details in the `Edit Browser Notification Settings`, which is available in the top-right corner dropdown.
4. Save the settings
5. Download the service worker file and move it to your root directory (usercom-service-worker.js). This file is required in order to send browser notifications.

## Copyright and license

Copyright © 2008-2017 A Produle Systems Pvt Ltd. www.produle.com. All rights reserved. This project is released under the Apache 2.0 license. UserCom.io and usercomio names belong to 'A Produle Systems Pvt Ltd'
