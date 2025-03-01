import amqp from "amqplib";
import logger from "../monitering/logging";
const QUEUE_NAME = "videos";

export default async function connectRabbitMQ() {
    try {
      const connection = await amqp.connect("amqp://localhost");
      const channel = await connection.createChannel();
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      logger.info("Connected to RabbitMQ");
      return channel;
    } catch (err) {
      logger.error("RabbitMQ connection error:", err);
    }
}