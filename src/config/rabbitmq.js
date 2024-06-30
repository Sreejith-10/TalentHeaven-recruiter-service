import amqp from "amqplib/callback_api.js";
import dotenv from "dotenv";

dotenv.config();

let queue = "job_service_queue";
let channel = null;

export const createConnectionMQ = () => {
	amqp.connect(process.env.AMQP_URL, async (err0, connection) => {
		if (err0) {
			throw err0;
		}
		channel = await connection.createChannel();
		await channel.assertExchange(queue, "direct", {durable: false});
		const q = await channel.assertQueue("", {exclusive: true});
		console.log("Waiting for data");
		channel.bindQueue(q.queue, queue, "JOB_POST");
		channel.bindQueue(q.queue, queue, "OTP");
		channel.consume(
			q.queue,
			(msg) => {
				const key = msg.fields.routingKey;

				switch (key) {
					case "JOB_POST":
						console.log(msg.content.toString());
						break;
					case "OPT":
						console.log(msg.content.toString());
						break;
					default:
						break;
				}
			},
			{noAck: true}
		);
	});
};
