import { Bot } from '@lib/bot';


// The event's name (used by the bot to identify this event).
export const name = 'ready';


/**
 * Event's handler
 * @param client The bot's client.
 */
export async function execute(client: Bot) {
	client.logger.info('Client connected !');
}
