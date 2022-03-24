# KitsuneHelper_VPS #
Welcome to the official GitHub repository for Kitsune Helper! As you'll notice, there are several branches but two are primarily active. These are the testing branch and the main branch. Before you start getting scared, don't worry, I will explain!

## Master ##
This branch is the stable one, and all features that are up and running perfectly with little to no flaws will be published. I say little to none because as any coder knows, even if you code something to be resilient to pretty much every error, there will be errors. Still, the errors that can occur are very rare so there's no need to worry about the bot going offline due to an issue. If you're starting out and want to copy this bot's code, this is the branch that I recommend you follow and keep your code checked against.

## Master Testing ##
This is the less stable branch, the one that I will use for testing. If you're using this one, expect to see a lot of commits as opposed to the main branch since I'm testing and want to immediately publish the results in case I find code I want to revert to. I do not recommend using this branch as it does include bugs. They can and will happen but I try to smooth them out.


## Installation ##
If you're looking to improve this and want to try it out on your own, I strongly recommend you follow this guide:
> 1. Clone the repository onto your machine using the GitHub CLI.
> The command is: git clone https://github.com/Coder-Tavi/KitsuneHelper_VPS.git
> 2. Install eslint global.
> The command is: npm install -g eslint
> 3. Toy around with the code and enjoy! .example_eslintrc.json is set to my personal preferences, and you can modify it as you see fit for your own coding desires.

Please note that you WILL need a config.json file. However, I've created a small template below that you can copy from. Paste in your information and modify as needed!
```json
{
  "bot": {
    "applicationId": "123456789012345678",
    "devGuildId": "123456789012345678",
    "errorChannel": "123456789012345678",
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