## Process for Grunt build   
 Navigate to the project root folder and execute   
 grunt /*grunt to execute the default function inside gruntfile.js*/
 
## Auto Build Process using Grunt and Travis CI
1. Go to the travis-ci.org website and signup.
2. Authorize the repository you want to get access. 
3. Create a github token for the project repository and add it in the travis ci Environment Variables *More Options > Settings* with keyname as *GH_TOKEN*.
4. Add Travis CI service in the git repository *Interactions and Services*. 
5. Modify push.sh file with git user details and your repository path at lines 2,3 and 13.
6. Copy the markdown url from the travis-ci project and place it inside the README.md file to update the build status in the git repository.
7. Travis builds the code and pushes the minified code to the git source while pushing the changes.