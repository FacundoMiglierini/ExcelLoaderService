import { Container } from 'inversify';

import { broker, INTERFACE_TYPE } from '../config/config';
import { JobRepository } from '../repositories/jobRepository';
import { CustomModelRepository } from '../repositories/customModelRepository';
import { JobErrorRepository } from '../repositories/jobErrorRepository';
import { IJobRepository } from '../interfaces/IJobRepository';
import { IJobErrorRepository } from '../interfaces/IJobErrorRepository';
import { ICustomModelRepository } from '../interfaces/ICustomModelRepository';
import { startChannel } from '../utils/rabbitUtils';
import { IProcessFileUseCase } from '../interfaces/IProcessFileUseCase';
import { ProcessFileUseCase } from '../usecases/processFileUseCase';


const container = new Container();

container.bind<IJobRepository>(INTERFACE_TYPE.JobRepository).to(JobRepository);
container.bind<IJobErrorRepository>(INTERFACE_TYPE.JobErrorRepository).to(JobErrorRepository);
container.bind<ICustomModelRepository>(INTERFACE_TYPE.CustomModelRepository).to(CustomModelRepository);
container.bind<IProcessFileUseCase>(INTERFACE_TYPE.ProcessFileUseCase).to(ProcessFileUseCase);

const useCase = container.get<ProcessFileUseCase>(INTERFACE_TYPE.ProcessFileUseCase);

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
                await useCase.processFile(JSON.parse(msg.content.toString()))
            channel.ack(msg);
        }, {
            noAck: false
        });
    } catch (error) {
        console.error("Error in RabbitMQ consumer connection: ", error)
    }

}
