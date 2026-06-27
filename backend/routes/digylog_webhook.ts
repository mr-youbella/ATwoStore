import { FastifyInstance } from "fastify";

export default async function digylogWebhook(fastify: FastifyInstance)
{
	fastify.put("/trackings/webhook", async (req: any, reply) =>
	{
		const body = req.body;		
		if (body.type === "subscribe" && body.key)
		{
			fastify.log.info(`🔑 Webhook handshake: ${body.key}`);
			return (reply.status(200).send({ key: body.key }));
		}
		const { traking } = body;
		if (!traking?.trim())
		{
			fastify.log.warn("⚠️ Webhook: tracking is empty");
			return (reply.send({ ok: true }));
		}

		try
		{
			await fastify.pg.query(`INSERT INTO digylog_trackings (user_id, tracking) VALUES (1, $1) ON CONFLICT (user_id, tracking) DO NOTHING`, [traking]);
			fastify.log.info(`✅ Tracking saved: ${traking}`);
			return (reply.send({ ok: true }));
		}
		catch (err)
		{
			fastify.log.error(`❌ Failed to save tracking: ${traking} — ${err}`);
			return (reply.send({ ok: true }));
		}
	});
}
