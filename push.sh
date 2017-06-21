 
setup_git() {
  git config --global user.email "ckavin@produle.com"
  git config --global user.name "ckavinkumar"
}

commit_website_files() { 
  git fetch -p origin
  Branch="$(git rev-parse --abbrev-ref HEAD)"
  git checkout $Branch
  git add WebContent/dist/*
  git commit --message "Travis build: $TRAVIS_BUILD_NUMBER"
}

upload_files() {
  Branch="$(git rev-parse --abbrev-ref HEAD)"
  echo "active current Branch=" $Branch 
  TRAVIS_Branch="$(TRAVIS_BRANCH)"
  echo "TRAVIS_Branch=" $TRAVIS_Branch
  echo $(TRAVIS_BRANCH)
  git remote add origin-pages https://${GH_TOKEN}@github.com/ckavinkumar/usercomio.git > /dev/null 2>&1 
  git push origin-pages $(TRAVIS_BRANCH)
}

setup_git
commit_website_files
upload_files
