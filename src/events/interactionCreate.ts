import { Bot } from '@lib/bot';
import { CommandInteraction } from 'discord.js';


// The event's name (used by the bot to identify this event).
export const name = 'interactionCreate';


/**
 * Event's handler
 * @param interaction The interaction that triggered the event.
 * @param client The bot's client.
 */
export async function execute(interaction: CommandInteraction, client: Bot) {
	if (interaction.isCommand()) {
		await client.commands.get(interaction.commandName)?.execute(interaction, client);
	}
}
