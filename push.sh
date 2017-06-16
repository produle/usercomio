setup_git() {
  git config --global user.email "ckavin@produle.com"
  git config --global user.name "ckavinkumar"
}

commit_website_files() {
  Branch="$(git rev-parse --abbrev-ref HEAD)"
  git checkout $Branch
  git add WebContent/dist/*
  git commit --message "Travis build: $TRAVIS_BUILD_NUMBER"
}

upload_files() {
  git remote add origin-pages https://${GH_TOKEN2}@github.com/ckavinkumar/usercomio.git > /dev/null 2>&1 
  git push origin-pages master  
}

setup_git
commit_website_files
upload_files
