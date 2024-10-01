import { Channel } from "amqplib";
import rabbitMQConfig from "../../../config/rabbitMQconfig";
import { randomUUID } from "crypto";
import { EventEmitter } from "events";


export default class Producer {
    constructor(private channel: Channel,private replyQueueName: string, private eventEmitter: EventEmitter){}

    async produceMessage(data:any = {}, operation:string){
        const uuid = randomUUID();
        console.log(`Producing message with UUID: ${uuid}`);


        this.channel.sendToQueue(rabbitMQConfig.rabbitMQ.queues.courseQueue, Buffer.from(JSON.stringify(data)), {
            replyTo: this.replyQueueName,
            correlationId: uuid,
            headers: {function : operation}
        });

        return new Promise((resolve,reject) => {
            this.eventEmitter.once(uuid, async (message) => {
                try{
                       const reply = JSON.parse(message.content.toString())
                       console.log('Received reply in producer:', reply);
                       resolve(reply);
                }catch(error){
                    reject(error);
                }
            })
        })

    }
}