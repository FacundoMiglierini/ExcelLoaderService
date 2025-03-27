import { Amqp } from 'typescript-amqp';
import { broker } from '../config/config';


async function publish(data: {id: string, filename: string, schema: any}) {

    const amqp = new Amqp();
    const connection = await amqp.connect(broker.URI); 
    const channel = await connection.createChannel()
    await channel.assertExchange(broker.BROKER_EXCHANGE, 'fanout', {
      durable: false
    });

    console.debug(`Msg published.`)
    await channel.publish(broker.BROKER_EXCHANGE, '', Buffer.from(JSON.stringify(data)));
}

export { publish };
