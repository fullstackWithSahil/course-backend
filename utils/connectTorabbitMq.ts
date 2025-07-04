import amqp from "amqplib";

export async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect("amqp://localhost"); // or your RabbitMQ URL
    const channel = await connection.createChannel();
    await channel.assertQueue("videos", { durable: true });
    console.log("Connected to RabbitMQ");
    return channel;
  } catch (error) {
    console.log("error connecting to rabbitMQ");
    throw error;
  }
}