import { Bot } from '@lib/bot';
import { token } from '@src/config.json';
import { GatewayIntentBits, Partials } from 'discord.js';


const client = new Bot({
	intents: [
		// You need to add your intents.
	],
	partials: [
		// Same for the partials.
	],
});


(async () => {
	await client.start(token);

	if (process.argv.includes('-L')) {
		await client.uploadCommands();
	}
})();
