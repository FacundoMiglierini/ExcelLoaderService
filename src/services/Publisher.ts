import { broker } from '../config/config';
import { startChannel } from '../utils/rabbitUtils';


async function publish(id: string, filename: string, schema: any) {

    const channel = await startChannel();
    channel.publish(broker.BROKER_EXCHANGE, '', Buffer.from(JSON.stringify({ jobId: id, filename: filename, schema: schema })));
    console.debug(`Msg published.`)
}

export { publish };
