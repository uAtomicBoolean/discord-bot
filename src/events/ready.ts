import { Bot } from '@lib/bot';


export const name = 'ready';


/**
 * Handler pour l'évènement.
 * @param client Le client du bot.
 */
export async function execute(client: Bot) {
	client.log('Client connecté !');
}
