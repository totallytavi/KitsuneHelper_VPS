# KitsuneHelper_VPS #
Welcome to the official GitHub repository for Kitsune Helper! If you're curious why it's called `VPS`, that's because this code used to be private and used to sync code between my computer and a VPS. I have left it in to preserve the URL and the history.

## Master ##
This branch is the stable one, and all features that are up and running perfectly with little to no flaws will be published. I say little to none because as any coder knows, even if you code something to be resilient to pretty much every error, there will be errors. Still, the errors that can occur are very rare so there's no need to worry about the bot going offline due to an issue. If you're starting out and want to copy this bot's code, this is the branch that I recommend you follow and keep your code checked against.


## Installation ##
### Prerequisite ##
- Node.js v16
- Code Editor
- Discord bot
- Internet connection (Recommended: 1 mbps+)

## Installing Node.js ##
1. Go to the [Node.js website](https://nodejs.org) and select the LTS (Long term support) version as long as it is version 16 or higher. You can select the current version but I have verified that all of the code present works with Node.js v16.11.1.
2. Install the package. Please TICK the checkbox asking if you want to install NPM. You will need this later.
3. You will receive a prompt for Chocolatey. This is required and you should install it.
4. To verify that you have installed Node.js, run the following command in your command editor of choice
- `node -v`
- `Output: 16.11.1` (This will vary)

## Installing git ##
1. Go to the [Git CLI website](https://git-scm.com/downloads) and download the version that suits your OS best.
2. Open the downloaded package and install it.
3. To verify you have installed git, run the following command in your command editor of choice
- `git --version`
- `Output: git version 2.32.0 (Apple Git-132)` (This will vary)

## Installing the Repository ##
1. Clone the repository onto your machine using the GitHub CLI.
- The command is: `git clone https://github.com/Coder-Tavi/KitsuneHelper_VPS.git`
2. Toy around with the code and enjoy!
- `.example_eslintrc.json` is set to my personal preferences (Plus the GitHub Actions settings) but you can modify it as you see fit for your own coding desires.

Please note that you WILL need a config.json file. However, I've created a small template below that you can copy from. Paste in your information and modify as needed!
```json
{
  "bot": {
    "applicationId": "123456789012345678",
    "devGuildId": "123456789012345678",
    "errorChannel": "123456789012345678",
    "ksoft": "ksoft_token_here",
    "token": "token_here"
  },
  "danbooru": {
    "username": "Username",
    "api_key": "ApiKey"
  "mysql": {
    "host": "0.0.0.0",
    "user": "Username",
    "password": "Password",
    "database": "database"
  }
}
```
