import axios from "axios";
import type { Request, Response } from "express";

type fileType = { data: { ObjectName: string; Path: string }[] };

export async function deleteVideo(req: Request, res: Response) {
	try {
		const { key } = req.body;

		const headers = {
			accept: "application/json",
			AccessKey: "4bf30c6a-4924-41f6-bb822899ea28-858d-465e",
		};

		const resolutions = ["1080", "720", "360", "144"];

		const urlsToDeletePromise = resolutions.map(async (res) => {
			const url = `https://syd.storage.bunnycdn.com/buisnesstool-course/${key}/${res}/`;
			const { data }: fileType = await axios.get(url, { headers });
			return data.map(
				(file) =>
					`https://syd.storage.bunnycdn.com${file.Path.endsWith("/") ? file.Path : file.Path + "/"}${file.ObjectName}`
			);
		});

		const urlsToDelete = await Promise.all(urlsToDeletePromise);
		let filesToDelete = urlsToDelete.flat();

		while (filesToDelete.length > 0) {
			const currentBatch = filesToDelete.splice(0, 95);

			const currentBatchPromises = currentBatch.map((fileurl) =>
				axios
					.delete(fileurl, { headers })
					.then(() => fileurl)
					.catch((error) => {
						console.error("Error deleting:", fileurl, error?.response?.data || error.message);
						return null;
					})
			);

			const deleted = await Promise.all(currentBatchPromises);
			console.log({ deletedFiles: deleted.filter(Boolean) });
		}

		res.json("files deleted");
	} catch (error) {
		console.error("Error deleting video:");
		res.status(500).json({ error: "There was an error deleting the video." });
	}
}