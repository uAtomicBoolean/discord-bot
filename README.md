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

## Development
You can add your commands and events in the `src/commands` and `src/events` folders so that the bot will automatically load them when starting.  
The following are required by the bot to load the commands and events :
- The variable/constant `command` that contains the command's builder.
- The variable/constant `name` that contains the event's name.
- The asynchronous function `execute` for both the events and commands.

A logger (pino) is available through the client with the `client.logger` attribute.  
This logger is configured to use `pino-pretty` to make the logs readable but you can remove it to have the logs with a JSON format that comes by default with `pino`.  
