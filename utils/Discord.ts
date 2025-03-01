import axios from 'axios';
import logger from '../monitering/logging';


export default async function sendDiscordMessage(message:string) {
    try {
        await axios.post(process.env.DISCORD_WEBHOOK_URL!,{ content: message });
    } catch (error) {
        logger.error('Failed to send message to Discord:', error);
    }
}