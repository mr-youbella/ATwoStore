import { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";

export default async function register(fastify: FastifyInstance)
{
	fastify.post<{ Body: { username: string; email: string; password: string; digylog_token?: string } }>("/auth/register",
	{
		schema:
		{
			body:
			{
				type: "object",
				required: ["username", "email", "password"],
				properties:
				{
					username:      { type: "string", minLength: 3, pattern: "^[a-z_]+$" },
					email:         { type: "string", format: "email" },
					password:      { type: "string", minLength: 6 },
					digylog_token: { type: "string" },
				},
			},
		},
	}, async (req, reply) =>
	{
		const { username, email, password, digylog_token } = req.body;
		try
		{
			const password_hash = await bcrypt.hash(password, 10);
			const { rows } = await fastify.pg.query(
				`INSERT INTO users (username, email, password_hash, digylog_token)
				 VALUES ($1, $2, $3, $4) RETURNING id, username, email, digylog_token, created_at`,
				[username, email, password_hash, digylog_token ?? null]
			);
			const user  = rows[0];
			const token = fastify.jwt.sign({ id: user.id, username: user.username, email: user.email, token: user.token ?? null });
			return (reply.code(201).send({ token, user }));
		}
		catch (err: any)
		{
			if (err.code === "23505")
			{
				const field = err.detail?.includes("username") ? "username" : "email";
				return (reply.code(409).send({ error: `${field} already exists` }));
			}
			throw err;
		}
	});
}
