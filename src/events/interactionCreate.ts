import { Bot } from '@lib/bot';
import { CommandInteraction } from 'discord.js';


export const name = 'interactionCreate';


/**
 * Handler pour l'évènement.
 * @param interaction L'interaction qui a trigger l'évènement.
 * @param client Le client du bot.
 */
export async function execute(interaction: CommandInteraction, client: Bot) {
	if (interaction.isCommand()) {
		await client.commands.get(interaction.commandName)?.execute(interaction, client);
	}
}
