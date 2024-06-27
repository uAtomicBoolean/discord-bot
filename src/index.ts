import { Bot } from '@lib/bot';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// TODO Add your intents and partials.
const client = new Bot({
	intents: [],
	partials: [],
});


(async () => {
	const startStatus = await client.start();
	if (startStatus.started) {
		client.logger.info('Bot successfully started.');
	}
	else {
		client.logger.error('An error occured while starting the bot.');
		client.logger.error(startStatus.message);
		process.exit(1);
	}

	// As I don't remember if the bot automatically load the commands to a 
	// guild when joining, this bit of code is commented.
	// if (!!process.env.BASE_GUILD_ID) {
	// 	await client.uploadCommands(process.env.BASE_GUILD_ID);
	// }
	// else {
	// 	await client.uploadCommands();
	// }
})();
