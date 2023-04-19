import { Bot } from '@lib/bot';
import { SlashCommandBuilder, CommandInteraction } from 'discord.js';


/* ----------------------------------------------- */
/* COMMAND BUILD                                   */
/* ----------------------------------------------- */
export const data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Pong !');


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour la commande.
 * @param inter L'interaction générée par la commande.
 * @param client Le client du bot.
 */
export async function execute(inter: CommandInteraction, client: Bot) {
	await inter.reply(`Pong ${inter.user} !`)
		.catch(error => client.logErrCommande('ping', error));
}
