import axios from "axios";
const baseUrl = "https://syd.storage.bunnycdn.com/buisnesstool-course";

const options = {
	headers: {
		accept: "application/json",
		AccessKey: "4bf30c6a-4924-41f6-bb822899ea28-858d-465e",
	},
};

export async function listFiles(key: string) {
	const resolutions = ["1080", "720", "360", "144"];
	const urls: string[] = [];
	for (let i = 0; i < resolutions.length; i++) {
		const res = resolutions[i];
		const url = `${baseUrl}/${key}/${res}/`;
		const data = await axios.get(url, options);
		data.data.forEach((obj: any) => {
			urls.push(
				`https://syd.storage.bunnycdn.com${obj.Path}${obj.ObjectName}`
			);
		});
	}
	return urls;
}

export async function deleteFiles(files: string[]) {
    let filesToDelete = [...files];
    
    while (filesToDelete.length > 0) {
        // Process files in batches of 95 due to API limits
        const currentBatch = filesToDelete.splice(0, 95);
        
        // Delete current batch of files
        const deletePromises = currentBatch.map(async (file) => {
            try {
                await axios.delete(file, options);
                console.log("deleted file", file);
                return { success: true, file };
            } catch (error) {
                console.log("error deleting", file);
                return { success: false, file, error };
            }
        });
        
        const results = await Promise.all(deletePromises);
        
        // Optional: Handle failed deletions
        const failedFiles = results
            .filter(result => !result.success)
            .map(result => result.file);
            
        if (failedFiles.length > 0) {
            console.log(`Failed to delete ${failedFiles.length} files:`, failedFiles);
            // You might want to retry failed files or throw an error
        }
    }
    
    return "OK";
}