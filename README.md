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
mongod  /* This will start mongodb server with default port 27017 */
npm run dev /* Starts the usercom application at port 3000 */
```

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
        rating:'5'  /* Sample Custom Data */
    })
    </script>
    ```


## Create AppID in Usercom
1. Goto `http://localhost:3000/register` to register as new user.
2. Login with the credentials entered.
3. Click `Select an App` at the top navigation bar, then *Add New App*.
4. Enter the details to obtain an AppID.