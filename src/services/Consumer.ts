import { Container } from 'inversify';
import { Amqp } from 'typescript-amqp';
import { broker, INTERFACE_TYPE } from '../config/config';
import { JobRepository } from '../repositories/jobRepository';
import { UploadFileUseCase } from '../usecases/uploadFileUseCase';
import { CustomSchemaRepository } from '../repositories/customSchemaRepository';
import { JobErrorRepository } from '../repositories/jobErrorRepository';
import { IJobRepository } from '../interfaces/IJobRepository';
import { IJobErrorRepository } from '../interfaces/IJobErrorRepository';
import { ICustomSchemaRepository } from '../interfaces/ICustomSchemaRepository';
import { IUploadFileUseCase } from '../interfaces/IUploadFileUseCase';


const container = new Container();

container.bind<IJobRepository>(INTERFACE_TYPE.JobRepository).to(JobRepository);
container.bind<IJobErrorRepository>(INTERFACE_TYPE.JobErrorRepository).to(JobErrorRepository);
container.bind<ICustomSchemaRepository>(INTERFACE_TYPE.CustomSchemaRepository).to(CustomSchemaRepository);
container.bind<IUploadFileUseCase>(INTERFACE_TYPE.UploadFileUseCase).to(UploadFileUseCase);

const useCase = container.get<UploadFileUseCase>(INTERFACE_TYPE.UploadFileUseCase);

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
