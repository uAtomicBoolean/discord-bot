# discord-bot
A simple discord bot template.  

You can use whichever package manager you want, just don't forget to remove the bun.lockb file before using another one.  
Some scripts are available in the package.json :
- dev : start the bot and watches for modifications to restart automatically on save.
- build : compile the bot to use on production.
- start : build then start the bot.
- up_cmd : build, start the bot and upload the commands to the base guild.

## Installation
Install the dependencies with your package manager (ex: bun):
`bun install`

You can update the dependencies to avoid any security issues :
`bun update`

Set your .env file with your environment variables :
`cp .env.example .env`

You should also change the name, description, author and repo link in the `package.json`.  

