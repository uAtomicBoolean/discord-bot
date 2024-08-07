import { commandsArray, discordId } from '@lib/types';
import { ApplicationCommandDataResolvable, Client, ClientOptions, Collection, REST, Routes } from 'discord.js';
import fs from 'fs';
import pino from 'pino';


const NodeCache = require('node-cache');


export class Bot extends Client {
	// This variable is necessary to load the events and commands from dist and
	// not src (and the opposite) when running the code after compilation.
	private static readonly _srcPath = `${__dirname}/..`;

	// A simple cache useful to store temporary data.
	// It is configured to store the data for 1 day before deleting them.
	public readonly cache: typeof NodeCache;

	// Logger for the bot.
	public readonly logger = pino({
		transport: {
			target: 'pino-pretty',
		},
	});

	// Array used to store the commands and their handlers.
	public commands: commandsArray;


	constructor(options: ClientOptions) {
		super(options);

		this.commands = new Collection();
		this.cache = new NodeCache({ stdTTL: 86400 });

		this.loadCommands();
		this.loadEvents();
	}

	/**
     * Starts the bot with a log.
     */
	async start() {
		this.logger.info('Starting the bot.');
		const startStatus = { started: null, message: '' };
		await super.login(process.env.TOKEN).then(
			() => {
				startStatus.started = true;
			},
			(reason) => {
				startStatus.started = false;
				startStatus.message = reason.message;
			},
		);
		return startStatus;
	}

	/* ----------------------------------------------- */
	/* ASSETS                                          */

	/* ----------------------------------------------- */
	/**
     * Load the commands handlers in the bot.
     */
	loadCommands() {
		const commandsPath = `${Bot._srcPath}/commands`;

		const commands = fs.readdirSync(commandsPath, { withFileTypes: true })
			.filter(filent => filent.isFile())
			.map(filent => filent.name);

		this.logger.info('Loading the commands!');
		for (const command of commands) {
			this.logger.info(`\t command: ${command}`);
			const data = require(`${commandsPath}/${command}`);
			this.commands.set(data.command.name, data);
		}
	}

	/**
     * Loads the events handlers in the bot.
     */
	loadEvents() {
		const eventsPath = `${Bot._srcPath}/events`;

		const events = fs.readdirSync(eventsPath, { withFileTypes: true })
			.filter(filent => filent.isFile())
			.map(filent => filent.name);

		this.logger.info('Loading the events!');
		for (const event of events) {
			this.logger.info(`\t event: ${event}`);

			const data = require(`${eventsPath}/${event}`);
			const dataExc = async (...args: any[]) => {
				await data.execute(...args, this);
			};

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
			commands.push(command.command.toJSON());
			this.logger.info(`Loading the commmand: ${command.command.toJSON().name}`);
		});

		const rest = new REST({ version: '10' }).setToken(this.token);

		this.logger.info(`Started refreshing ${this.commands.size} application (/) commands!`);
		try {
			if (targetGuildId) {
				await rest.put(
					Routes.applicationGuildCommands(this.user.id, targetGuildId),
					{ body: commands },
				);
			}
			else {
				await rest.put(
					Routes.applicationCommands(this.user.id),
					{ body: commands },
				);
				this.logger.info('The commands may take up to an hour before being available in all the guilds.');
			}

			this.logger.info(`Finished refreshing ${this.commands.size} application (/) commands!`);
		}
		catch (error) {
			this.logger.error('An error occured while refreshing the application (/) commands!');
			this.logger.error(error.message);
		}
	}
}
