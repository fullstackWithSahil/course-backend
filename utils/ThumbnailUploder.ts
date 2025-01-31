import fs from 'fs';
import sharp from 'sharp';
import fileUploader from "./fileUploder";

export async function uploadThumbnail(path: string, key: string): Promise<void> {
    try {
        // Process image with sharp
        const webpBuffer = await sharp(path)
            .rotate() // Auto-rotate based on EXIF data
            .resize(160, 90, {
                fit: 'cover',
                withoutEnlargement: true
            })
            .webp({ quality: 80 }) // Convert to WebP with good quality/size balance
            .toBuffer();

        // Create a temporary file path for the processed image
        const tempWebpPath = path.replace(/\.[^/.]+$/, '') + '_temp.webp';
        
        // Write the processed image to temporary file
        await fs.promises.writeFile(tempWebpPath, webpBuffer as any);

        // Upload with retry logic
        let isUploaded = false;
        const maxRetries = 13;
        let retryCount = 0;

        while (!isUploaded && retryCount < maxRetries) {
            try {
                console.log(`Uploading thumbnail (attempt ${retryCount + 1}):`, tempWebpPath);
                await fileUploader(tempWebpPath, `${key}.webp`);
                isUploaded = true;
            } catch (error) {
                retryCount++;
                console.log(`Upload failed. Retrying... (${retryCount}/${maxRetries})`);
                
                if (retryCount === maxRetries) {
                    throw new Error(`Failed to upload after ${maxRetries} attempts: ${error}`);
                }
                
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
            }
        }

        // Clean up files
        await Promise.all([
            fs.promises.unlink(path),
            fs.promises.unlink(tempWebpPath)
        ]).catch(error => {
            console.error('Error cleaning up files:', error);
        });

    } catch (error) {
        console.error('Error processing or uploading image:', error);
        throw error;
    }
}