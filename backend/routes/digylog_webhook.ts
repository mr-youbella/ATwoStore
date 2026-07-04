import { FastifyInstance } from "fastify";

export default async function digylogWebhook(fastify: FastifyInstance)
{
	fastify.put<{Params: { code: string; } }>("/trackings/webhook/:code", async (req, reply) =>
	{
		const { code } = req.params;

		const { rows } = await fastify.pg.query(`SELECT id FROM users WHERE webhook_code = $1 LIMIT 1`, [code]);
		if (rows.length === 0)
			return (reply.status(404).send({error: "Invalid webhook code"}));
		const user_id = rows[0].id;

		const body = req.body as any;
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

		await fastify.pg.query(`INSERT INTO digylog_trackings (user_id, tracking) VALUES ($1, $2) ON CONFLICT (user_id, tracking) DO NOTHING`, [user_id, traking]);

		return (reply.send({ ok: true }));
	});
}
