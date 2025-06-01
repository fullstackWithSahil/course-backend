import { Router } from "express";
import { DeleteVideo } from "../controllers/Video.controller";

const VideoRouter = Router()

VideoRouter.post("/delete",DeleteVideo);

export default VideoRouter;