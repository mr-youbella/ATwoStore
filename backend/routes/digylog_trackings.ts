import { FastifyInstance } from "fastify";

export default async function trackingsRoute(fastify: FastifyInstance)
{
	fastify.get("/digylog_trackings", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		const { rows } = await fastify.pg.query(
			"SELECT tracking FROM digylog_trackings WHERE user_id = $1 ORDER BY created_at DESC",
			[req.user.id]
		);
		return reply.send(rows.map((r: any) => r.tracking));
	});

	fastify.get("/digylog_trackings/:user_id", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		if (!req.user.is_admin)
			return reply.status(403).send({ error: "Forbidden" });
		const user_id = parseInt(req.params.user_id, 10);
		if (isNaN(user_id))
			return reply.status(400).send({ error: "Invalid user ID" });
		const { rows } = await fastify.pg.query(
			"SELECT tracking FROM digylog_trackings WHERE user_id = $1 ORDER BY created_at DESC",
			[user_id]
		);
		return reply.send(rows.map((r: any) => r.tracking));
	});

	fastify.post<{ Body: { tracking: string } }>("/digylog_trackings", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		const { tracking } = req.body;
		if (!tracking?.trim())
			return reply.status(400).send({ error: "Tracking is required" });
		try
		{
			const { rows } = await fastify.pg.query(
				`INSERT INTO digylog_trackings (user_id, tracking)
				 VALUES ($1, $2) RETURNING id, tracking, created_at`,
				[req.user.id, tracking]
			);
			return reply.status(201).send(rows[0]);
		}
		catch (err: any)
		{
			if (err.code === "23505")
				return reply.status(409).send({ error: "Tracking already exists" });
			throw err;
		}
	});

	fastify.delete<{ Params: { tracking: string } }>("/digylog_trackings/:tracking", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		const { tracking } = req.params;
		const { rows } = await fastify.pg.query(
			"DELETE FROM digylog_trackings WHERE user_id = $1 AND tracking = $2 RETURNING *",
			[req.user.id, tracking]
		);
		if (!rows.length)
			return reply.status(404).send({ error: "Tracking not found" });
		return reply.send({ message: "Deleted successfully" });
	});
}
