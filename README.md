# KitsuneHelper_VPS #
Welcome to the official GitHub repository for Kitsune Helper! If you're curious why it's called `VPS`, that's because this code used to be private and used to sync code between my computer and a VPS. I have left it in to preserve the URL and the history.

## Master ##
This branch is the stable one, and all features that are up and running perfectly with little to no flaws will be published. I say little to none because as any coder knows, even if you code something to be resilient to pretty much every error, there will be errors. Still, the errors that can occur are very rare so there's no need to worry about the bot going offline due to an issue. If you're starting out and want to copy this bot's code, this is the branch that I recommend you follow and keep your code checked against.


## Installation ##
### Prerequisites ##
- NVM (Node Version Manager)
- Node.js v19
- Code Editor (VSC, Atom, etc.)
- Git
- Discord bot
- Internet connection

### Installing Node.js via NVM ###
We recommend the usage of NVM, a command line tool that allows you to manage version of Node.js quickly and easily, all with a few commands.
1. Go to the NVM repository ((https://github.com/nvm-sh/nvm)[https://github.com/nvm-sh/nvm] | **Windows**, see next step)
2. Download the latest version of NVM by scrolling down to the "Install & Update Script" section and copying the command
Windows Users: Go to here and use the installer: (https://github.com/coreybutler/nvm-windows#install-nvm-windows)[https://github.com/coreybutler/nvm-windows#install-nvm-windows]
3. Run the command you selected above, following the instructions provided in the script (Windows users, run the installer)
4. Run `nvm -v` in your console. If you see an error, NVM was likely not installed or you didn't follow the script's instructions right. Try reopening your terminal
5. Run `nvm install 19`. This will install the latest version of Node.js (v19) onto your machine
6. To verify that you have installed Node.js, run the following command in your command editor of choice
- `node -v`
- `Output: v19.7.0` (This will vary)

### Installing git ###
1. Go to the [Git CLI website](https://git-scm.com/downloads) and download the version that suits your OS best
2. Open the downloaded package and install it
3. To verify you have installed git, run the following command in your command editor of choice
- `git --version`
- `Output: git version 2.40.0.windows.1` (This will vary)

### Installing the Repository ###
1. Clone the repository onto your machine using the GitHub CLI.
- The command is: `git clone https://github.com/Coder-Tavi/KitsuneHelper_VPS.git`
2. Toy around with the code and enjoy!

Please note that you WILL need a config.json file. However, I've created a small template below that you can copy from. Paste in your information and modify as needed!
```json
{
  "bot": {
    "applicationId": "",
    "guildId": "",
    "console": "",
    "token": ""
  },
  "danbooru": {
    "username": "",
    "api_key": ""
  },
  "mysql": {
    "host": "",
    "user": "",
    "password": "",
    "database": "",
    "port": 0
  }
}
```