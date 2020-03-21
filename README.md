# CityNewsBeatAIProject
  City News Beat, Inc. owns and operates the streaming Television channels Tar Heel News Beat, Seattle News Beat, NYC News Beat and Bay Area News Beat for Roku users. Incubated as part of Cohort 11 in 2019 @Launch-Chapel Hill, a not-for-profit organization funded by the Town of Chapel Hill, Orange County and the University of North Carolina, City News Beat is committed to delivering an agenda-free view of local news and weather for the cord-cutter and Smart TV communities they serve across the USA. 
  We are going to create an A.I. engine that can read different data sources including questions asked at the time the app is loaded, that matches 3rd party data to know more about the device users’ interests. Our goal is to deliver each user a Newscast-for-1 based on those preferences.
  
  # One way to run this app:
  - Clone this repo: copy the https address, open VScode, View / Command Palette / Git: Clone / paste the address / choose path for this       project.
  - Install dependencies: right click in root directory for this project from VScode / open in terminal / write in VScode terminal: npm install / npm init (press enter for all options)
  - Run app in browser: Write in VScode terminal: npx browser-sync start -sw
      - A new tab should open with the app
  
  # To collaborate in this project:
  - Remember to create your own branch: 
      - write in VScode terminal: git checkout -b nameOfYourBranch
      - to go to your branch: git checkout nameOfYourBranch
  - Before working on your branch make sure your branch is up to date with the master (git pull)
  - Save changes periodically to your branch:
      - git status    //So you know everything that has been updated
      - git add .     //Add those changes to the working tree
      - git commit -m "write your message here"    //Commit changes to working tree
      - git push origin nameOfYourBranch           //Push updates to your branch in repo
   - Then, ask for a new pull request to merge with the master branch
   
   # The csv file:
   - First column is the output column
   - Rest of the columns are inputs
   - Normalize your data
   - Choose your settings to train the network (see workSpace.js and ml.js)
    
