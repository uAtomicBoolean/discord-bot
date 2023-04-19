import { Bot } from '@lib/bot';
import { SlashCommandBuilder, CommandInteraction } from 'discord.js';


/* ----------------------------------------------- */
/* COMMAND BUILD                                   */
/* ----------------------------------------------- */
export const data = new SlashCommandBuilder()
	.setName('sync_commands')
	.setDescription('Met à jour les commandes dans le serveur actuel.')
	.setDMPermission(false)
	.setDefaultMemberPermissions(8192);


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour la commande.
 * @param inter L'interaction générée par la commande.
 * @param client Le client du bot.
 */
export async function execute(inter: CommandInteraction, client: Bot) {
	let isInteractionUnknown = false;
	await inter.deferReply({ ephemeral: true }).catch(() => {
		client.log('Une interaction n\'a pas été trouvée ! (sync_commands:deferReply)', 2);
		isInteractionUnknown = true;
	});

	if (isInteractionUnknown) return;

	client.log('Exécution de la commande \'sync_commands\'', 1);
	await client.uploadCommands();

	return inter.editReply({ content: 'Commandes mises à jour.' })
		.catch(error => client.logErrCommande('sync_commands', error));
}
