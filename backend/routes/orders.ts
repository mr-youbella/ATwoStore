import { FastifyInstance } from "fastify";

export default async function myOrdersRoute(fastify: FastifyInstance)
{
	fastify.get("/orders", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		const { rows } = await fastify.pg.query
		(
			`SELECT o.*, json_agg(json_build_object('id', r.id, 'designation', r.designation, 'quantity', r.quantity)) AS refs
			 FROM orders o
			 LEFT JOIN orders_refs r ON r.order_id = o.id
			 WHERE o.user_id = $1
			 GROUP BY o.id
			 ORDER BY o.createdAt DESC`,
			[req.user.id]
		);
		return reply.send(rows);
	});
	fastify.get("/orders/:id", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		const { id } = req.params;
		const { rows } = await fastify.pg.query
		(
			`SELECT o.*, json_agg(json_build_object('id', r.id, 'designation', r.designation, 'quantity', r.quantity)) AS refs
       		FROM orders o
       		LEFT JOIN orders_refs r ON r.order_id = o.id
       		WHERE o.user_id = $1 AND o.id = $2
       		GROUP BY o.id`,
			[req.user.id, id]
		);

		if (rows.length === 0)
			return reply.code(404).send({ message: "Order not found" });
		return reply.send(rows[0]);
	});

	fastify.post<{ Body: { orders: { name: string; phone: string; address: string; city: string; price: number; refs: { designation: string; quantity: number }[] }[] } }> ("/orders", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		const { orders } = req.body;
	
		if (!orders?.length)
			return reply.status(400).send({ error: "Orders array is required" });
	
		const client = await fastify.pg.connect();
		try
		{
			await client.query("BEGIN");
		
			const inserted = [];
			for (const order of orders)
			{
				const { name, phone, address, city, price, refs } = order;
			
				const { rows } = await client.query(
					`INSERT INTO orders (user_id, name, phone, address, city, price)
					 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
					[req.user.id, name, phone, address, city, price ?? 0]
				);
			
				const order_id = rows[0].id;
			
				for (const ref of refs)
				{
					await client.query(
						`INSERT INTO orders_refs (order_id, designation, quantity)
						 VALUES ($1, $2, $3)`,
						[order_id, ref.designation, ref.quantity]
					);
				}
				inserted.push(order_id);
			}
		
			await client.query("COMMIT");
			return reply.status(201).send({ ids: inserted });
		}
		catch (err)
		{
			await client.query("ROLLBACK");
			throw err;
		}
		finally
		{
			client.release();
		}
	});

	fastify.delete<{ Params: { id: string } }>("/orders/:id", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		const { id } = req.params;
		const { rows } = await fastify.pg.query(
			"DELETE FROM orders WHERE id = $1 AND user_id = $2 RETURNING *",
			[id, req.user.id]
		);
		if (!rows.length)
			return reply.status(404).send({ error: "Order not found" });
		return reply.send({ message: "Deleted successfully" });
	});
}
