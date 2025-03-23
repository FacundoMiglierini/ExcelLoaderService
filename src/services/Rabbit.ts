import { Amqp } from 'typescript-amqp';
import { FileInteractor } from '../interactors/fileInteractor';
import { JobInteractor } from '../interactors/jobInteractor';
import { JobRepository } from '../repositories/jobRepository';
import { FileRepository } from '../repositories/fileRepository';
import JobStatus from '../enums/Job';
import processFile from '../utils/fileProcessing';
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



async function consume() {

    const fileRepository = new FileRepository(); //TODO manage this repos another way
    const jobRepository = new JobRepository();
    const fileInteractor = new FileInteractor(fileRepository);
    const jobInteractor = new JobInteractor(jobRepository);

    const amqp = new Amqp();
    const connection = await amqp.connect(broker.URI); 
   
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
      if (msg.content) {
          const jobId = msg.content.toString()
          const job = await jobRepository.find(jobId)

          if (!job)
              throw new Error("File Upload process not found.");

          await jobRepository.updateStatus(job.id, JobStatus.PROCESSING);
          const file = processFile(job);

          if (job.job_errors.length > 0) 
            await jobRepository.updateErrors(job.id, job.job_errors);

          await fileRepository.create(file);
          await jobRepository.updateStatus(job.id, JobStatus.DONE);
          await jobRepository.updateFileRef(job.id, job.file_id);
          console.log(`File processed successfully.`);
      }
      channel.ack(msg);
    }, {
      noAck: false
    });
}

consume().catch(err => console.error("Error during consume: ", err))

export { publish, consume };
