import express from "express";
import controller from "./src/controllerts";
const app = express();

app.use(express.json());


app.post("/api/transcode",controller);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("listening on port " + port);
});
