import axios from 'axios';


export default async function sendDiscordMessage(message:string) {
    try {
        await axios.post(process.env.DISCORD_WEBHOOK_URL!,{ content: message });
    } catch (error) {
        console.error('Failed to send message to Discord:', error);
    }
}