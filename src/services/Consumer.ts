import { Container } from 'inversify';

import { broker, INTERFACE_TYPE } from '../config/config';
import { JobRepository } from '../repositories/jobRepository';
import { UploadFileUseCase } from '../usecases/uploadFileUseCase';
import { CustomModelRepository } from '../repositories/customModelRepository';
import { JobErrorRepository } from '../repositories/jobErrorRepository';
import { IJobRepository } from '../interfaces/IJobRepository';
import { IJobErrorRepository } from '../interfaces/IJobErrorRepository';
import { ICustomModelRepository } from '../interfaces/ICustomModelRepository';
import { IUploadFileUseCase } from '../interfaces/IUploadFileUseCase';
import { startChannel } from '../utils/rabbitUtils';


const container = new Container();

container.bind<IJobRepository>(INTERFACE_TYPE.JobRepository).to(JobRepository);
container.bind<IJobErrorRepository>(INTERFACE_TYPE.JobErrorRepository).to(JobErrorRepository);
container.bind<ICustomModelRepository>(INTERFACE_TYPE.CustomModelRepository).to(CustomModelRepository);
container.bind<IUploadFileUseCase>(INTERFACE_TYPE.UploadFileUseCase).to(UploadFileUseCase);

const useCase = container.get<UploadFileUseCase>(INTERFACE_TYPE.UploadFileUseCase);

export default async function brokerConsumerConnection() {

    try {

        const channel = await startChannel();
        const queue = await channel.assertQueue('', {
          exclusive: true
        });
        console.log(` [*] Waiting for messages in ${queue.queue}. To exit press CTRL+C`);
        await channel.bindQueue(queue.queue, broker.BROKER_EXCHANGE, '');
        channel.consume(queue.queue, async (msg: any) => {
            if (msg.content)
                await useCase.saveFile(JSON.parse(msg.content.toString()))
            channel.ack(msg);
        }, {
            noAck: false
        });
    } catch (error) {
        console.error("Error in RabbitMQ consumer connection: ", error)
    }

}
