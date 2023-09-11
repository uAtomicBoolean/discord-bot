import fs from 'fs';
import pino from 'pino';
import { discordId } from '@lib/types';
import { commandsArray } from '@lib/types';
import { green, yellow, red } from 'ansicolors';
import { Client, ClientOptions, Collection, ApplicationCommandDataResolvable, REST, Routes } from 'discord.js';


const NodeCache = require('node-cache');


export class Bot extends Client {
	// This variable is necessary to load the events and commands from dist and
	// not src (and the opposite) when running the code after compilation.
	private static readonly _srcPath = `${__dirname}/..`;

	// A simple cache usefull to store temporary data.
	// It is configured to store the data for 1 day before deleting them.
	public readonly cache: typeof NodeCache;

	// Logger for the bot.
	public readonly logger = pino({});

	public commands: commandsArray;
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
	 */
	async start() {
		this.logger.info('Starting the bot.');
		await super.login(process.env.TOKEN);
		this.logger.info('Uploading the commands to the base guild.');
		this.logger.info('To upload the commands to all the guilds, use the command "/sync_commands" or start the bot with the -L parameter.');
		await this.uploadCommands(process.env.BASE_GUILD_ID);
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

		this.logger.info('Loading the commands!');
		for (const command of commands) {
			this.logger.info(`\t command: ${command}`);
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

		this.logger.info('Loading the events!');
		for (const event of events) {
			this.logger.info(`\t event: ${event}`);

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
		this.logger.info('The commands will be refreshed in ' + (targetGuildId
			? `the guild '${targetGuildId}'.`
			: 'all the guilds.'
		));

		const commands: ApplicationCommandDataResolvable[] = [];
		this.commands.map(command => {
			commands.push(command.data.toJSON());
			this.logger.info(`Loading the commmand: ${command.data.toJSON().name}`);
		});

		const rest = new REST({ version: '10' }).setToken(this.token);

		this.logger.info(`Started refreshing ${this.commands.size} application (/) commands!`);
		try {
			await rest.put(
				Routes.applicationGuildCommands(this.user.id, targetGuildId),
				{ body: commands },
			);

			this.logger.info(`Finished refreshing ${this.commands.size} application (/) commands!`);
		}
		catch (error) {
			this.logger.info('An error occured while refreshing the application (/) commands!', 2);
			console.error(error);
		}
	}
}