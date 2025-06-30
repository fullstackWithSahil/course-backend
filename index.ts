import mongoose from 'mongoose';
import express from 'express';
import chatRouter from './routes/Chats.routes';
import messageRouter from './routes/Message.routes';
const app = express();

app.use(express.json());

app.use("/api/chats",chatRouter);
app.use("/api/messages",messageRouter);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  mongoose.connect('mongodb://127.0.0.1:27017/buisnesstools');
});