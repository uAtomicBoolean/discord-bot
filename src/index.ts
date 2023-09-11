import dotenv from 'dotenv';
import { Bot } from '@lib/bot';
import { GatewayIntentBits, Partials } from 'discord.js';

// TODO Add your .env path here (ex: src/.env.dev).
dotenv.config({ path: '' });


const client = new Bot({
	intents: [
		// You need to add your intents.
	],
	partials: [
		// Same for the partials.
	],
});


(async () => {
	await client.start();

	if (process.argv.includes('-L')) {
		await client.uploadCommands();
	}
})();
