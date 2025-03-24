import { Amqp } from 'typescript-amqp';
import { broker } from '../config/config';
import { JobRepository } from '../repositories/jobRepository';
import { FileRepository } from '../repositories/fileRepository';
import { UploadFileUseCase } from '../usecases/uploadFileUseCase';


const jobRepository = new JobRepository();
const fileRepository = new FileRepository();
const useCase = new UploadFileUseCase(jobRepository, fileRepository);

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
                await useCase.createFile(msg.content.toString())
            channel.ack(msg);
        }, {
            noAck: false
        });
    } catch (error) {
        console.error("Error in RabbitMQ consumer connection: ", error)
    }

}
