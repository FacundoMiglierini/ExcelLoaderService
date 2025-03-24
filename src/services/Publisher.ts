import { Amqp } from 'typescript-amqp';
import { broker } from '../config/config';


async function publish(id: string) {

    const amqp = new Amqp();
    const connection = await amqp.connect(broker.URI); 

    const channel = await connection.createChannel()
    await channel.assertExchange(broker.BROKER_EXCHANGE, 'fanout', {
      durable: false
    });

    console.log(`Msg with content: ${id} published.`)
    await channel.publish(broker.BROKER_EXCHANGE, '', Buffer.from(id));
}

export { publish };
