import { Bot } from '@lib/bot';


export const name = 'ready';


export async function execute(client: Bot) {
	client.log('Client connecté !');
}
