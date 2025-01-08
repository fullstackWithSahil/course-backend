const Docker = require("dockerode");
const docker = new Docker({ host: 'localhost', port: 2375 });

export async function startContainers(resolution:string) {
    try {
        // Create the container with proper volume mapping and environment variables
        let auxContainer = await docker.createContainer({
            Image: 'my-app', // Ensure this image exists locally
            Env: [
                `RESOLUTION=${resolution}`
            ],
            HostConfig: {
                Binds: [
                    // Map host directories to container paths
                    "C:/Users/Sahil Pramod nayak/Desktop/project/freshBackend/download:/app/download"
                ]
            }
        });

        console.log("Container created with ID:", auxContainer.id);

        // Start the container
        await auxContainer.start();
    } catch (error) {
        console.error("Error starting containers:", error);
    }
}