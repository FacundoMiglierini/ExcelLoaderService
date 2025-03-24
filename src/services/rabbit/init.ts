import { Amqp } from 'typescript-amqp';
import { broker } from '../../config/config';

async function rabbitConnection() {
    const amqp = new Amqp();
    const connection = await amqp.connect(broker.URI); 

    const channel = await connection.createChannel()
    await channel.assertExchange(broker.BROKER_EXCHANGE, 'fanout', {
      durable: false
    });
}
