import fs from 'fs';
import { discordId } from '@lib/types';
import { commandsArray } from '@lib/types';
import { green, yellow, red } from 'ansicolors';
import { Client, ClientOptions, Collection, ApplicationCommandDataResolvable, REST, Routes } from 'discord.js';


const NodeCache = require('node-cache');


export class Bot extends Client {
	static readonly LOG_LEVELS = ['INFO', 'WARNING', 'ERROR'];

	// This variable is necessary to load the events and commands from dist and
	// not src (and the opposite) when running the code after compilation.
	private static readonly _srcPath = `${__dirname}/..`;

	public commands: commandsArray;

	// A simple cache usefull to store temporary data.
	// It is configured to store the data for 1 day before deleting them.
	public readonly cache: typeof NodeCache;

	public customAttributes: { [key: string]: unknown };


	constructor(options: ClientOptions) {
		super(options);

		this.commands = new Collection();
		this.cache = new NodeCache({ stdTTL: 86400 });
		this.customAttributes = {};

		this.loadCommands();
		this.loadEvents();
	}

	/**
	 * Starts the bot with a log.
	 * @param token The bot's token.
	 */
	async start(token: string) {
		this.log('Starting the bot.');
		await super.login(token);
	}

	/* ----------------------------------------------- */
	/* LOGGING                                         */
	/* ----------------------------------------------- */
	/**
	 * Generate the colored text from the text and the log level.
	 * @param level The log level (0=OK, 1=WARNING, 2=ERROR)
	 * @returns The colored text.
	 */
	_getLevelTxt(level: number): string {
		switch (level) {
			case 0:
				return green(Bot.LOG_LEVELS[level]);
			case 1:
				return yellow(Bot.LOG_LEVELS[level]);
			case 2:
				return red(Bot.LOG_LEVELS[level]);
			default:
				return 'UNKNOWN';
		}
	}

	/**
	 * Display a log in the console.
	 * @param text The log message.
	 * @param level The log level (default = 0).
	 */
	log(text: string, level: number = 0) {
		const date = new Date();
		const dateFormat = `${date.getFullYear()}-${date.getMonth()}-${date.getDay()} `
			+ `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}:`
			+ `${String(date.getSeconds()).padStart(2, '0')}`;
		console.log(`${dateFormat} ${this._getLevelTxt(level)} : ${text}`);
	}

	/**
	 * Display a log for an error that occured in a command.
	 * @param cmdName The command's name.
	 * @param error The error.
	 */
	logErrCommande(cmdName: string, error: unknown) {
		this.log(`An error occured in the command "${cmdName}"!`, 1);
		console.log(error);
	}

	/* ----------------------------------------------- */
	/* ASSETS                                          */
	/* ----------------------------------------------- */
	/**
	 * Load the commands handlers in the bot.
	 */
	loadCommands() {
		const commandsPath = `${Bot._srcPath}/commands`;

		// Filtering the files to avoid the .map files.
		// These files are used by the Typescript debugger.
		const commands = fs.readdirSync(commandsPath, { withFileTypes: true })
			.filter(filent => filent.isFile() && !filent.name.endsWith('.map'))
			.map(filent => filent.name);

		this.log('Loading the commands!');
		for (const command of commands) {
			this.log(`\t command: ${command}`);
			const data = require(`${commandsPath}/${command}`);
			this.commands.set(data.data.name, data);
		}
	}

	/**
	 * Loads the events handlers in the bot.
	 */
	loadEvents() {
		const eventsPath = `${Bot._srcPath}/events`;

		const events = fs.readdirSync(eventsPath, { withFileTypes: true })
			.filter(filent => filent.isFile() && !filent.name.endsWith('.map'))
			.map(filent => filent.name);

		this.log('Loading the events!');
		for (const event of events) {
			this.log(`\t event: ${event}`);

			const data = require(`${eventsPath}/${event}`);
			const dataExc = async (...args: any[]) => { await data.execute(...args, this); };

			if (data.once) {
				this.once(data.name, dataExc);
			}
			else {
				this.on(data.name, dataExc);
			}
		}
	}

	/**
	 * Upload the commands to either a specific guild or all the guilds.
	 */
	async uploadCommands(targetGuildId?: discordId) {
		this.log('The commands will be refreshed in ' + (targetGuildId
			? `the guild '${targetGuildId}'.`
			: 'all the guilds.'
		));

		const commands: ApplicationCommandDataResolvable[] = [];
		this.commands.map(command => {
			commands.push(command.data.toJSON());
			this.log(`Loading the commmand: ${command.data.toJSON().name}`);
		});

		const rest = new REST({ version: '10' }).setToken(this.token);

		this.log(`Started refreshing ${this.commands.size} application (/) commands!`);
		try {
			await rest.put(
				Routes.applicationGuildCommands(this.user.id, targetGuildId),
				{ body: commands },
			);

			this.log(`Finished refreshing ${this.commands.size} application (/) commands!`);
		}
		catch (error) {
			this.log('An error occured while refreshing the application (/) commands!', 2);
			console.error(error);
		}
	}
}