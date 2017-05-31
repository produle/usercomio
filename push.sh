setup_git() {
  git config --global user.email "pbaskaran@produle.com"
  git config --global user.name "pbaskaran"
}

commit_website_files() {
  git checkout master 
  git add WebContent/dist/*
  git commit --message "Travis build: $TRAVIS_BUILD_NUMBER"
}

upload_files() {
  git remote add origin-pages https://${GH_TOKEN}@github.com/produle/usercomio.git > /dev/null 2>&1 
  git push origin-pages master  
}

setup_git
commit_website_files
upload_files
