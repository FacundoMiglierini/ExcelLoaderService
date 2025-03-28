import { Amqp } from 'typescript-amqp';
import { broker } from '../config/config';
import { JobRepository } from '../repositories/jobRepository';
import { UploadFileUseCase } from '../usecases/uploadFileUseCase';
import { CustomSchemaRepository } from '../repositories/customSchemaRepository';
import { JobErrorRepository } from '../repositories/jobErrorRepository';


const jobRepository = new JobRepository();
const jobErrorRepository = new JobErrorRepository();
const customSchemaRepository = new CustomSchemaRepository();
const useCase = new UploadFileUseCase(jobRepository, jobErrorRepository, customSchemaRepository);

export default async function brokerConsumerConnection() {

    try {
        const amqp = new Amqp();
        const connection = await amqp.connect(broker.URI); 
        console.log("Connected to RabbitMQ.")
        const channel = await connection.createChannel()
        await channel.assertExchange(broker.BROKER_EXCHANGE, 'fanout', {
          durable: false
        });

        const queue = await channel.assertQueue('', {
          exclusive: true
        });

        console.log(` [*] Waiting for messages in ${queue.queue}. To exit press CTRL+C`);

        await channel.bindQueue(queue.queue, broker.BROKER_EXCHANGE, '');

        channel.consume(queue.queue, async (msg: any) => {
            if (msg.content)
                await useCase.createFile(JSON.parse(msg.content.toString()))
            channel.ack(msg);
        }, {
            noAck: false
        });
    } catch (error) {
        console.error("Error in RabbitMQ consumer connection: ", error)
    }

}
