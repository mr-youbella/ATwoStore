import { FastifyInstance } from "fastify";

export default async function pickupsRoute(fastify: FastifyInstance)
{
	fastify.get("/admin/users", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		if (!req.user.is_admin)
			return reply.status(403).send({ error: "Forbidden" });
	
		try
		{
			const { rows } = await fastify.pg.query(
				`SELECT u.*, COUNT(t.tracking) as tracking_count
				 FROM users u
				 LEFT JOIN digylog_trackings t ON t.user_id = u.id
				 GROUP BY u.id
				 ORDER BY u.created_at DESC`
			);
		
			return reply.send(rows);
		}
		catch (err)
		{
			req.log.error(err);
			return reply.status(500).send({ error: "Internal Server Error" });
		}
	});
	
	fastify.get("/admin/users/:id", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		if (!req.user.is_admin)
			return reply.status(403).send({ error: "Forbidden" });
	
		try
		{
			const { rows } = await fastify.pg.query(
				`SELECT * FROM users WHERE id = $1`,
				[req.params.id]
			);
		
			if (!rows.length)
				return reply.status(404).send({ error: "User not found" });
		
			return reply.send(rows[0]);
		}
		catch (err)
		{
			req.log.error(err);
			return reply.status(500).send({ error: "Internal Server Error" });
		}
	});
	
	fastify.delete("/admin/users/:id", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		if (!req.user.is_admin)
			return reply.status(403).send({ error: "Forbidden" });
	
		try
		{
			const { rowCount } = await fastify.pg.query(
				"DELETE FROM users WHERE id = $1",
				[req.params.id]
			);
		
			if (!rowCount)
				return reply.status(404).send({ error: "User not found" });
		
			return reply.send({ ok: true });
		}
		catch (err)
		{
			req.log.error(err);
			return reply.status(500).send({ error: "Internal Server Error" });
		}
	});
	
	fastify.get("/admin/orders/:user_id", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		if (!req.user.is_admin)
			return reply.status(403).send({ error: "Forbidden" });
	
		try
		{
			const { user_id } = req.params;
		
			const user = await fastify.pg.query(
				`SELECT id FROM users WHERE id = $1`,
				[user_id]
			);
		
			if (!user.rows.length)
				return reply.status(404).send({ error: "User not found" });
		
			const { rows } = await fastify.pg.query
			(
				`SELECT o.*,
					json_agg(
						json_build_object(
							'id', r.id,
							'designation', r.designation,
							'quantity', r.quantity
						)
					) FILTER (WHERE r.id IS NOT NULL) AS refs
				 FROM orders o
				 LEFT JOIN orders_refs r ON r.order_id = o.id
				 WHERE o.user_id = $1
				 GROUP BY o.id
				 ORDER BY o.createdAt DESC`,
				[user_id]
			);
		
			return reply.send(rows);
		}
		catch (err)
		{
			req.log.error(err);
			return reply.status(500).send({ error: "Internal Server Error" });
		}
	});

	fastify.delete<{ Params: { id: string } }>("/admin/orders/:user_id/:id", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		if (!req.user.is_admin)
			return reply.status(403).send({ error: "Forbidden" });
		try
		{
			const { user_id, id } = req.params;

			const { rows } = await fastify.pg.query(
				"DELETE FROM orders WHERE id = $1 AND user_id = $2 RETURNING *",
				[id, user_id]
			);

			if (!rows.length)
				return reply.status(404).send({ error: "Order not found" });

			return reply.send({ message: "Deleted successfully" });
		}
		catch (err)
		{
			req.log.error(err);
			return reply.status(500).send({ error: "Internal Server Error" });
		}
	});
}
