import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

async function sendDiscordMessage(message:string) {
    try {
        await axios.post(process.env.DISCORD_WEBHOOK_URL!,{ content: message });
    } catch (error) {
        console.error('Failed to send message to Discord:', error);
    }
}

export default async function setup() {
    const outputDir = path.join(__dirname, 'output');
    try {
        await fs.mkdir(outputDir, { recursive: true });
    } catch (error) {
        await sendDiscordMessage("Error setting up folders");
        process.exit(1);
    }

    const resolutions = ["1080", "720", "360", "144"];

    await Promise.all(resolutions.map(async (resolution) => {
        const resolutionDir = path.join(outputDir, resolution);

        try {
            await fs.mkdir(resolutionDir, { recursive: true });
        } catch (error) {
            await sendDiscordMessage("Error setting up folders");
            process.exit(1);
        }
    }));

    console.log('All folders created successfully.');
}

setup()