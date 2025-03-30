import { broker } from "../config/config";
import { connect, Channel } from "amqplib";

export async function startChannel(): Promise<Channel> {

    const connection = await connect(broker.URI); 
    console.log("Connected to RabbitMQ.")
    const channel = await connection.createChannel()
    await channel.assertExchange(broker.BROKER_EXCHANGE, 'direct', {
      durable: false
    });

    return channel;
}

