import { broker } from '../config/config';
import { startChannel } from '../utils/rabbitUtils';

/**
 * Publishes a message to the RabbitMQ broker.
 * 
 * This function creates a channel, formats a message containing job information, 
 * and publishes it to the broker's exchange.
 * 
 * @param id - The job identifier
 * @param filename - The filename associated with the job
 * @param schema - The schema associated with the job
 */
async function publish(id: string, filename: string, schema: any) {

    const channel = await startChannel();
    channel.publish(broker.BROKER_EXCHANGE, '', Buffer.from(JSON.stringify({ jobId: id, filename: filename, schema: schema })));
    console.debug(`Msg published.`)
}

export { publish };
