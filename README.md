[![Build Status](https://travis-ci.org/produle/usercomio.svg?branch=master)](https://travis-ci.org/produle/usercomio)

# UserCom.io
A Open-Source platform to track, engage and convert users of your application, record events performed by them to improve usability with the help of reported metrics.

## Requirements
 - NodeJS v7+ [[Installation Guide](https://nodejs.org/en/download/package-manager/)]
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

## Setup Nginx as a reverse proxy
It is optional to use nginx in front of the NodeJS server, as it helps improving the overall performance. The following steps can be applied to run Usercom on top of nginx.
1. [Install](https://www.nginx.com/resources/wiki/start/topics/tutorials/install/) Nginx on the server.
2. In `nginx.conf`, modify the following snippet to route the HTTP requests to NodeJS
	```
    server {
        listen       80;
        server_name  localhost;

        location / {
                proxy_pass http://localhost:3000;	#Path to NodeJS server
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }
        
        .....
        .....
    }
    ```
    
3. Restart Nginx server using `sudo nginx -s reload`

### Using HTTPS connections
1. Generate the required SSL certificates and copy them to the nginx installation path.
2. In `nginx.conf`, modify the following snippet to route the HTTPS requests to NodeJS
	```
    server {
        listen       443 ssl;
        server_name  localhost;
        
        ssl_certificate      local.example.com.crt; #Path of certificate relative to nginx installation directory
        ssl_certificate_key  local.example.com;	#Path of key file relative to nginx installation directory

        ssl_session_cache    shared:SSL:1m;
        ssl_session_timeout  5m;

        ssl_ciphers  HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers  on;

        location / {
                proxy_pass http://localhost:3000;	#Path to NodeJS server
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }
        
        ....
        ....
    }
        
    #Proxy for WebSocket at 8001
    upstream websocket {
        server localhost:8001;
    }
    server {
        listen       8002 ssl;
        server_name  localhost;
        
        ssl_certificate      local.example.com.crt; #Path of certificate relative to nginx installation directory
        ssl_certificate_key  local.example.com;	#Path of key file relative to nginx installation directory
        
        ssl_session_cache    shared:SSL:1m;
        ssl_session_timeout  5m;
        
        ssl_ciphers  HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers  on;
        
        location / {
                proxy_pass http://websocket;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }
        
        ....
        ....
     }
    ```
3. You can also include verified certificate in the `ssl_certificate` config
4. Restart Nginx server using `sudo nginx -s reload`

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
        try {
            Usercom.init({
                name: "Jane Doe",   /* Fullname of the visitor */
                email: "janedoe@example.com",   /* Email Address of the visitor */
                created_at: 1312182000, /* Current timestamp */
                paid: true, /* Boolean */
                birthdate: "1990-01-01", /* Date in format YYYY-MM-DD */
                gender: "male", /* possible values ("male","female","other") */
                profilepicture: "", /* a valid profile picture url */
                rating:'5'  /* Sample Custom Data */
            });
        }catch(error){console.log(error);}
    </script>
    ``` 
## Using event tracking code inside the application

1. Copy and paste the below mentioned code to track the custom activity of the user.
2. The event details can be viewed under activities in user details view page

	```
	try {
        Usercom.track("View Product",{"product_id":1});   /* 1-Event Name(String) , 2-Event Properties(Object of any time)*/
    }catch(error){console.log(error);}
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
