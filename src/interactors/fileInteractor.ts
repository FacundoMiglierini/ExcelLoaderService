import { FileModel } from "../entities/File";
import { JobModel } from "../entities/Job";
import { File } from "../interfaces/IFile";
import { IFileInteractor } from "../interfaces/IFileInteractor";
import { IFileRepository } from "../interfaces/IFileRepository";


export class FileInteractor implements IFileInteractor {

    private repository: IFileRepository;

    constructor(repository: IFileRepository) {
        this.repository = repository
    }

    async createFile(input: any) {

        /*

        const queue = await this.channel.assertQueue('', {
        exclusive: true
        });

        console.log(` [*] Waiting for messages in ${queue.queue}. To exit press CTRL+C`);

        await this.channel.bindQueue(queue.queue, this.exchange, '');

        this.channel.consume(queue.queue, (msg: any) => {
        if (msg.content) {
          console.log(` [x] ${msg.content.toString()}`);
        }
        }, {
        noAck: true
        });

        const jobDoc = new JobModel({
            state: 'pending',
            job_errors: [],
            file_id: ''
        });

        const jobId = this.repository.create(jobDoc);

        await rabbitMQClient.getChannel().publish(rabbitMQClient.getExchange(), '', Buffer.from(input));

        return jobId;
        */
    }

    async getFile(id: Number) {

        /*
         * buscar File en DB 
         * retornar
         */

        return this.repository.find(id);
    }

}
