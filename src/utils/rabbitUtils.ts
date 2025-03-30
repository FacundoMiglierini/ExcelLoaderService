import { broker } from "../config/config";
import { connect, Channel } from "amqplib";

// This function establishes a connection to RabbitMQ using the URI from the broker configuration.
// It then creates a channel and asserts an exchange with the specified settings ('direct' type and non-durable).
// The function returns the created channel for further use in message publishing or consuming.
export async function startChannel(): Promise<Channel> {

    const connection = await connect(broker.URI); 
    console.log("Connected to RabbitMQ.")
    const channel = await connection.createChannel()
    await channel.assertExchange(broker.BROKER_EXCHANGE, 'direct', {
      durable: false
    });

    return channel;
}

