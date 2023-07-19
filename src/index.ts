import { Bot } from '@lib/bot';
import { token, guildId } from '@src/config.json';
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

	if (process.argv.includes('-l')) {
		await client.uploadCommands(guildId);
	}
})();
