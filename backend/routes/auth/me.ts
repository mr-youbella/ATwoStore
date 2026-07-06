import { FastifyInstance } from "fastify";

export default async function meRoute(fastify: FastifyInstance)
{
	fastify.get("/auth/me", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		const { rows } = await fastify.pg.query("SELECT id, username, email, digylog_token, email_verified, webhook_code, is_admin, created_at FROM users WHERE id = $1", [req.user.id]);
		if (!rows.length)
			return (reply.status(404).send({ error: "User not found" }));
		return (reply.send(rows[0]));
	});
	fastify.delete("/auth/delete", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		await fastify.pg.query("DELETE FROM users WHERE id = $1", [req.user.id]);
		return (reply.send({ ok: true }));
	});
}
