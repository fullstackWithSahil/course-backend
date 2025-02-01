import fs from 'fs/promises';
import path from 'path';
import sendDiscordMessage from '../utils/Discord';


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