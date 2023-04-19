import fs from 'fs';
import { guildId } from '@src/config.json';
import { commandsArray } from '@lib/types';
import { green, yellow, red } from 'ansicolors';
import { Client, ClientOptions, Collection, ApplicationCommandDataResolvable, REST, Routes } from 'discord.js';


const NodeCache = require('node-cache');


export class Bot extends Client {
	static readonly LOG_LEVELS = ['INFO', 'WARNING', 'ERROR'];
	private readonly _srcPath: string;

	public commands: commandsArray;
	public readonly cache: typeof NodeCache;

	public customAttributes: { [key: string]: unknown };


	constructor(options: ClientOptions) {
		super(options);

		// This variable is necessary to load the plugins from dist and
		// not src (and the opposite) when running the code after compilation.
		this._srcPath = `${__dirname}/..`;

		this.commands = new Collection();
		this.cache = new NodeCache({ stdTTL: 86400 });
		this.customAttributes = {};

		this.loadCommands();
		this.loadEvents();
	}

	/**
	 * Démarre le bot avec un log.
	 * @param token Le token du bot.
	 */
	async start(token: string) {
		this.log('Démarrage du bot.');
		await super.login(token);
	}

	/* ----------------------------------------------- */
	/* LOGGING                                         */
	/* ----------------------------------------------- */
	/**
	 * Génère le texte coloré pour le niveau du log.
	 * @param level Le niveau du log.
	 * @returns Une string colorée.
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
	 * Affiche un log.
	 * @param text Le message de log.
	 * @param level Le niveau du log.
	 */
	log(text: string, level: number = 0) {
		const date = new Date();
		const dateFormat = `${date.getFullYear()}-${date.getMonth()}-${date.getDay()} `
			+ `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}:`
			+ `${String(date.getSeconds()).padStart(2, '0')}`;
		console.log(`${dateFormat} ${this._getLevelTxt(level)} : ${text}`);
	}

	/**
	 * Affiche un log indiquant qu'une erreur est survenue dans une commande.
	 * @param cmd_name Le nom de la commande.
	 * @param error L'erreur.
	 */
	logErrCommande(cmd_name: string, error: unknown) {
		this.log(`Une erreur est survenue dans la commande "${cmd_name}" !`, 1);
		console.log(error);
	}

	/* ----------------------------------------------- */
	/* ASSETS                                          */
	/* ----------------------------------------------- */
	/**
	 * Charge les commandes d'un plugin dans le bot.
	 */
	loadCommands() {
		const commandsPath = `${this._srcPath}/commands`;

		// On filtre pour ne pas travailler sur les fichiers .map.
		// Ces fichiers sont utilisés par le débugger de Typescript.
		const commands = fs.readdirSync(commandsPath, { withFileTypes: true })
			.filter(filent => filent.isFile() && !filent.name.endsWith('.map'))
			.map(filent => filent.name);

		for (const command of commands) {
			this.log(`\t commande : ${command}`);
			const data = require(`${commandsPath}/${command}`);
			this.commands.set(data.data.name, data);
		}
	}

	/**
	 * Charge les évènements d'un plugin dans le bot.
	 */
	loadEvents() {
		const eventsPath = `${this._srcPath}/commands`;

		const events = fs.readdirSync(eventsPath, { withFileTypes: true })
			.filter(filent => filent.isFile() && !filent.name.endsWith('.map'))
			.map(filent => filent.name);

		for (const event of events) {
			this.log(`\t évènement : ${event}`);

			const data = require(`${eventsPath}/${event}`);
			const data_exc = async (...args: any[]) => { await data.execute(...args, this); };

			if (data.once) {
				this.once(data.name, data_exc);
			}
			else {
				this.on(data.name, data_exc);
			}
		}
	}

	/**
	 * Charge les commandes dans un serveur.
	 */
	async uploadCommands() {
		this.log('Les commandes vont être chargées dans ' + (guildId
			? `la guild '${guildId}'.`
			: 'toutes les guilds.'
		));

		const commands: ApplicationCommandDataResolvable[] = [];
		this.commands.map(command => {
			commands.push(command.data.toJSON());
			this.log(`Préparation de la commande : ${command.data.toJSON().name}`);
		});

		const rest = new REST({ version: '10' }).setToken(this.token);

		this.log(`Début de la mise à jour de ${this.commands.size} application (/) commands !`);
		try {
			await rest.put(
				Routes.applicationGuildCommands(this.user.id, guildId),
				{ body: commands },
			);

			this.log(`Fin de la mise à jour de ${this.commands.size} application (/) commands !`);
		}
		catch (error) {
			this.log('Un erreur est survenue durant l\'upload des commandes !', 2);
			console.error(error);
		}
	}
}