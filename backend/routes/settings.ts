import { FastifyInstance } from "fastify";

export default async function tokenRoute(fastify: FastifyInstance)
{
	fastify.put("/auth/saveToken", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		const { digylog_token } = req.body as { digylog_token: string };

		if (!digylog_token?.trim())
			return (reply.status(400).send({ error: "Token is required" }));

		const { rows } = await fastify.pg.query(
			"UPDATE users SET digylog_token = $1 WHERE id = $2 RETURNING id, username, email, digylog_token",
			[digylog_token, req.user.id]
		);
		return (reply.send(rows[0]));
	});
	fastify.put("/auth/username", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		const { username } = req.body as { username: string };
		if (!username?.trim() || username.length < 3)
			return (reply.status(400).send({ error: "Username too short" }));
		if (!/^[a-z_]+$/.test(username))
			return (reply.status(400).send({ error: "Username invalid" }));
		try
		{
			const exists = await fastify.pg.query("SELECT id FROM users WHERE username = $1", [username]);
			if (exists.rows.length)
				return (reply.status(409).send({ error: "Username already exists" }));
			await fastify.pg.query("UPDATE users SET username = $1 WHERE id = $2", [username, req.user.id]);
			return (reply.send({ ok: true }));
		}
		catch (err) { throw err; }
	});
}
