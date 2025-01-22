import express from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';
import type { FileFilterCallback } from 'multer';
import fs from 'fs';
import cors from 'cors';
import path from 'path';

interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
}

// Define multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = file.fieldname === 'video' ? 'uploads/videos' : 'uploads/thumbnails';
        fs.mkdirSync(uploadPath, { recursive: true }); // Ensure the directory exists
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

// Multer instance
const upload = multer({
    storage,
    fileFilter: (req, file, cb: FileFilterCallback) => {
        if (file.fieldname === 'video' && !file.mimetype.startsWith('video/')) {
            return cb(new Error('Invalid video file type'));
        }
        if (file.fieldname === 'thumbnail' && !file.mimetype.startsWith('image/')) {
            return cb(new Error('Invalid thumbnail file type'));
        }
        cb(null, true);
    }
});

const app = express();
app.use(express.json());

app.use(cors());

// Define route for uploading video and thumbnail
app.post(
    '/api/addVideo',
    upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]),
    async (req: Request, res: Response) => {
        try {
            const videoFile = (req.files as { [fieldname: string]: MulterFile[] })['video']?.[0];
            const thumbnailFile = (req.files as { [fieldname: string]: MulterFile[] })['thumbnail']?.[0];

            if (!videoFile || !thumbnailFile) {
                return res.status(400).json({
                    title: 'Invalid Upload',
                    description: 'Both video and thumbnail are required.'
                });
            }

            console.log('Video uploaded:', videoFile);
            console.log('Thumbnail uploaded:', thumbnailFile);

            res.json({
                message: 'Video and thumbnail uploaded successfully',
                videoPath: videoFile.path,
                thumbnailPath: thumbnailFile.path
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                title: 'Error adding video',
                description: 'There was an error uploading the video. Please try again later.'
            });
        }
    }
);

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('Listening on port', port);
});
