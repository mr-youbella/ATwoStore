import { FastifyInstance } from "fastify";

export default async function pickupsRoute(fastify: FastifyInstance)
{
	fastify.get("/admin/users", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		if (!req.user.is_admin)
			return reply.status(403).send({ error: "Forbidden" });
		const { rows } = await fastify.pg.query(
			`SELECT u.*, COUNT(t.tracking) as tracking_count
			 FROM users u
			 LEFT JOIN digylog_trackings t ON t.user_id = u.id
			 GROUP BY u.id
			 ORDER BY u.created_at DESC`
		);
		return reply.send(rows);
	});

	fastify.get("/admin/users/:id", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		if (!req.user.is_admin)
			return reply.status(403).send({ error: "Forbidden" });
		const { rows } = await fastify.pg.query(
			`SELECT * FROM users WHERE id = $1`, [req.params.id] 
		);
		return (reply.send(rows[0]));
	});

	fastify.delete("/admin/users/:id", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		if (!req.user.is_admin)
			return reply.status(403).send({ error: "Forbidden" });
		await fastify.pg.query("DELETE FROM users WHERE id = $1", [req.params.id]);
		return reply.send({ ok: true });
	});

	fastify.get("/admin/orders/:user_id", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		if (!req.user.is_admin)
			return reply.status(403).send({ error: "Forbidden" });
		const { user_id } = req.params;
		const { rows } = await fastify.pg.query
		(
			`SELECT o.*, json_agg(json_build_object('id', r.id, 'designation', r.designation, 'quantity', r.quantity)) AS refs
			 FROM orders o
			 LEFT JOIN orders_refs r ON r.order_id = o.id
			 WHERE o.user_id = $1
			 GROUP BY o.id
			 ORDER BY o.createdAt DESC`,
			[user_id]
		);
		return reply.send(rows);
	});
}
