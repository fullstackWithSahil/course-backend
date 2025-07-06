import { Router } from "express";
import { deleteVideo } from "../controller/Video.controller";

const VideoRouter = Router();

VideoRouter.post("/delete",deleteVideo)

export default VideoRouter;