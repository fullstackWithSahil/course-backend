import express from 'express';
import multer from 'multer';
import type { FileFilterCallback } from 'multer';
import fs from 'fs';
import cors from 'cors';
import path from 'path';
import connectRabbitMQ from './queues/connectQueue';
import type { Channel } from 'amqplib';
import addVideo from './addVideo';
import { uploadThumbnail } from './utils/ThumbnailUploder';


export interface MulterFile {
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
        if(req.path==="/api/addThumbnail"){
            const uploadPath = 'thumbnails';
            fs.mkdirSync(uploadPath, { recursive: true }); // Ensure the directory exists
            cb(null, uploadPath);
        }else{
            const uploadPath = file.fieldname === 'video' ? 'queues/uploads/videos' : 'queues/uploads/thumbnails';
            fs.mkdirSync(uploadPath, { recursive: true }); // Ensure the directory exists
            cb(null, uploadPath);
        }
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

export let channel:Channel|undefined;

// Define route for uploading video and thumbnail
app.post(
    '/api/addVideo',
    upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]),
    addVideo
);

app.post('/api/addThumbnail',upload.single('thumbnail'),async(req,res)=>{
    try {
        const thumbnailFile = (req.file as  MulterFile );
        const thumbnailPath = path.join(__dirname,"thumbnails",thumbnailFile.filename);
        await uploadThumbnail(thumbnailPath,req.body.key);
        fs.unlinkSync(thumbnailPath);
        res.send("ok");
    } catch (error) {
        console.log("error creating a thumbnail", error);
        res.json({
            title:"There was an error creating course",
            description:"There was an error creating course try again later"
        })
    }
})

app.get('/api/test', async(req,res)=>{
    res.send("<h1>Running...</h1>");
})

const port = process.env.PORT || 8080;
app.listen(port,async()=>{
    console.log("listening on port",port);
    channel = await connectRabbitMQ();
})
