To open website demo: https://city-news-beat.herokuapp.com/

To clone the git repo and deploy your own heroku app follow these instructions:

What you need:
- Node.js and npm
- Heroku
- Git
- Visual Studio Code (or any other code editor)


Open Visual Studio Code (or any other source code editor).
- Note: This walkthrough uses Visual Studio Code as source code editor.
  To install VS Code: https://code.visualstudio.com/

Clone the github repo.
In VS Code:
- Click View/Command Palette/
- Type: Git:clone
- Paste the following link: https://github.com/lkeilly/comp523Project.git
- Press Enter
- Select the folder where you would like to clone the repo.

Note: If you don't have git, please download it here:
https://git-scm.com/downloads
- Create a github account if you don't have one.
- Make sure in VS Code the git: Enable setting is checked. For this click in Manage (the tool icon on the bottom left corner) / Settings / type git enable on the search bar and make sure that box is checked.
- Restart your computer after installing git.

After you cloned the github repo
- Open the folder that you just cloned (if it's not already opened). For this go to File/Open folder/ and search for the location of the folder on your computer. 
- Go to Termianl/Open new terminal or right click on comp523Project folder and select open a new terminal.

Note: you should see on the terminal the path to the cloned folder Ex: C:\Users\UserName\Desktop\comp523Project

- If you don't have Node.js: Download and install Node.js OS installer at: https://nodejs.org/en/download/

On the VS Code terminal write: 
- npm install heroku
- After heroku is installed write: heroku login
- You should see something like this: 
  heroku: Press any key to open up the browser to login or q to exit
 ›   Warning: If browser does not open, visit
 ›   https://cli-auth.heroku.com/auth/browser/***
  heroku: Waiting for login...
  Logging in... done
  Logged in as me@example.com

Note: If you don't have a heroku account:
- On your browser go to heroku: https://dashboard.heroku.com
- Sign up to create a new account and enter your information.

Write on the VS Code terminal:
- heroku create nameOfApp --buildpack https://github.com/heroku/heroku-buildpack-static.git
- git init
- heroku git:remote -a nameOfApp
- git push heroku master

Go to heroku
- Select the app you just created
- Click on Open app on the top right corner

To save changes made to the heroku app in terminal on VS Code:
- git add .
- git commit -m "add a message"
- git push heroku master

To run locally:
- On the VS Code termianl: npx browser-sync start -sw


- For more help: https://devcenter.heroku.com/articles/
