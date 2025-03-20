import { Amqp } from 'typescript-amqp';
import { FileInteractor } from './interactors/fileInteractor';
import { JobInteractor } from './interactors/jobInteractor';
import { JobRepository } from './repositories/jobRepository';
import { FileRepository } from './repositories/fileRepository';

class RabbitMQClient {
  private channel: any;
  private connection: any;
  private exchange: any;

  async connect() {
    try {
      const amqp = new Amqp();
      this.connection = await amqp.connect('amqp://guest:guest@localhost:5672'); //TODO move credentials to.env
      this.exchange = 'files';
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.exchange, 'fanout', {
        durable: false
      });

      /*
      // Example message publishing
      const msg = "HOLA";
      await this.channel.publish(this.exchange, '', Buffer.from(msg));
      console.log(" [x] Sent %s", msg);
      */

      /*
      // Example message consuming
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
      */

    } catch (error) {
      throw error; 
    }
  }

  getChannel() {
    return this.channel;
  }

  getConnection() {
    return this.connection;
  }

  getExchange() {
    return this.exchange;
  }
}


async function publish(data: any) {

    const amqp = new Amqp();
    const connection = await amqp.connect('amqp://guest:guest@localhost:5672'); //TODO move credentials to.env
    const exchange = "excel"
   
    const channel = await connection.createChannel()
    await channel.assertExchange(exchange, 'fanout', {
      durable: false
    });

    await channel.publish(exchange, '', Buffer.from(JSON.stringify(data)));
}



async function consume() {

    const fileRepository = new FileRepository();
    const jobRepository = new JobRepository();

    const amqp = new Amqp();
    const connection = await amqp.connect('amqp://guest:guest@localhost:5672'); //TODO move credentials to.env
    const exchange = "excel"
   
    const channel = await connection.createChannel()
    await channel.assertExchange(exchange, 'fanout', {
      durable: false
    });

    const queue = await channel.assertQueue('', {
      exclusive: true
    });

    console.log(` [*] Waiting for messages in ${queue.queue}. To exit press CTRL+C`);

    await channel.bindQueue(queue.queue, exchange, '');

    channel.consume(queue.queue, (data: any) => {

      if (data.content) {

          /*
          jobRepository.updateStatus(id, 'processing');
          const file = processFile(schema, file_data);
          fileRepository.create(file);
          jobRepository.updateStatus(id, 'done');
          */

        console.log(` [x] ${data.content.toString()}`);
      }
    }, {
      noAck: true
    });
}

consume().catch(err => console.error("Error during consume: ", err))

//const rabbitMQClient = new RabbitMQClient();

export { publish, consume };
