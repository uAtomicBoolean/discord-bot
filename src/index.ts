import { Bot } from '@lib/bot';
import dotenv from 'dotenv';

// TODO Add your .env path here (ex: src/.env.dev).
dotenv.config({ path: '' });

// TODO Add your intents and partials.
const client = new Bot({
	intents: [],
	partials: [],
});


(async () => {
	client.logger.info('To load the commands to the base guild, use the option \'-l\'.');
	client.logger.info('To load the commands globally, use the option \'-L\' or the \'/sync_commands\' command.');

	const startStatus = await client.start();
	if (startStatus.started) {
		client.logger.info('Bot successfully started.');
	}
	else {
		client.logger.error('An error occured while starting the bot.');
		client.logger.error(startStatus.message);
	}

	if (process.argv.includes('-L')) {
		await client.uploadCommands();
	}
})();
