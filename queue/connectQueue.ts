import amqp from "amqplib";
const QUEUE_NAME = "videos";

export default async function connectRabbitMQ() {
    try {
      const connection = await amqp.connect("amqp://localhost");
      const channel = await connection.createChannel();
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      console.log("Connected to RabbitMQ");
      return channel;
    } catch (err) {
      console.error("RabbitMQ connection error:", err);
    }
}