import { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";

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
		catch (err)
		{
			throw err;
		}
	});
	fastify.put("/auth/password", { onRequest: [fastify.authenticate],
		schema:
		{
			body:
			{
				type: "object",
				required: ["old_password", "password"],
				properties: { old_password: { type: ["string", "null"] }, password: { type: "string", minLength: 6 }, },
			},
		}, }, async (req: any, reply) =>
	{
		const { old_password, password } = req.body as { old_password: string, password: string };
		if (!password?.trim() || password.length < 6)
			return (reply.status(400).send({ error: "Password too short" }));
		try
		{
			const { rows } = await fastify.pg.query("SELECT password_hash, provider FROM users WHERE id = $1", [req.user.id]);
			if (!rows.length)
				return reply.status(404).send({ error: "User not found" });
			if (!(rows[0].password_hash === null && old_password === null && rows[0].provider === "google"))
			{
				const is_valid = await bcrypt.compare(old_password, rows[0].password_hash);
				if (!is_valid)
					return reply.status(400).send({ error: "Current password is incorrect" });

				const same_assword = await bcrypt.compare(password, rows[0].password_hash);
				if (same_assword)
					return reply.status(400).send({ error: "New password must be different" });
			}
			const password_hash = await bcrypt.hash(password, 10);
			await fastify.pg.query("UPDATE users SET password_hash = $1 WHERE id = $2", [password_hash, req.user.id]);
			return (reply.send({ ok: true }));
		}
		catch (err)
		{
			throw err;
		}
	});
}
