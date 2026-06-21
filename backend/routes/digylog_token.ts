import { FastifyInstance } from "fastify";

export default async function tokenRoute(fastify: FastifyInstance)
{
	fastify.put("/auth/saveToken", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		const { digylog_token } = req.body as { digylog_token: string };

		if (!digylog_token?.trim())
			return reply.status(400).send({ error: "Token is required" });

		const { rows } = await fastify.pg.query(
			"UPDATE users SET digylog_token = $1 WHERE id = $2 RETURNING id, username, email, digylog_token",
			[digylog_token, req.user.id]
		);
		return reply.send(rows[0]);
	});
}
