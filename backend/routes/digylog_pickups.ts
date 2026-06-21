import { FastifyInstance } from "fastify";

export default async function pickupsRoute(fastify: FastifyInstance)
{
	fastify.get("/digylog_pickups", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		const { rows } = await fastify.pg.query(
			"SELECT * FROM digylog_pickups WHERE user_id = $1 ORDER BY created_at DESC",
			[req.user.id]
		);
		return reply.send(rows);
	});

	fastify.post<{ Body: { pickup_id: number; area: string; seller_phone: string; picker: string; picker_phone: string } }>("/digylog_pickups", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		const { pickup_id, area, seller_phone, picker, picker_phone } = req.body;
		try
		{
			const { rows } = await fastify.pg.query(
				`INSERT INTO digylog_pickups (user_id, pickup_id, area, seller_phone, picker, picker_phone)
				 VALUES ($1, $2, $3, $4, $5, $6)
				 RETURNING *`,
				[req.user.id, pickup_id, area, seller_phone, picker, picker_phone]
			);
			return reply.status(201).send(rows[0]);
		}
		catch (err)
		{
			throw err;
		}
	});

	fastify.delete<{ Params: { id: string } }>("/digylog_pickups/:id", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		const { id } = req.params;
		const { rows } = await fastify.pg.query("DELETE FROM digylog_pickups WHERE pickup_id = $1 AND user_id = $2 RETURNING *", [id, req.user.id]);
		if (!rows.length)
			return reply.status(404).send({ error: "Pickup not found" });
		return reply.send({ message: "Deleted successfully" });
	});
}
