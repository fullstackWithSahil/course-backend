import express from 'express';

const app = express();

app.use(express.json());
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types';
import connectRabbitMQ from './queue/connectQueue';
import type { Channel } from 'amqplib';

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL||"", 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||""
)

export let channel:Channel|undefined;

app.post('/api/transcode',async(req,res)=>{
    try {
        //get the course id from body and get all the videos in that course
        const {data:videos} = await supabase
            .from('videos')
            .select('url')
            .eq('course',req.body.course);
            console.log("videos:",videos);
        if(!videos) return res.status(404).json({message:"Invalid course id provided"});

        //enqueue the path of the videos in the queue
        videos.forEach((video)=>{
            if (!channel){
                console.log("error connecting to queue");
                return res.status(500).json({message:"Internal server error"});
            };
            channel.sendToQueue(
                "videos", 
                Buffer.from(JSON.stringify({path:video.url})), 
                { persistent: true }
            );
        });

        res.json({message:"Transcoding started"});
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal server error"});
    }
})

const port = process.env.PORT || 8080;
app.listen(port,async()=>{
    console.log("listening on port",port);
    channel = await connectRabbitMQ();
})