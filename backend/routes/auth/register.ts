import { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

async function generateWebhookCode(fastify: FastifyInstance): Promise<string>
{
	while (true)
	{
		const code = randomBytes(15).toString("hex");
		const { rowCount } = await fastify.pg.query("SELECT 1 FROM users WHERE webhook_code = $1", [code]);
		if (rowCount === 0)
			return (code);
	}
}

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
			const webhook_code = await generateWebhookCode(fastify);
			const { rows } = await fastify.pg.query(
				`INSERT INTO users (username, email, password_hash, digylog_token, webhook_code)
				 VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, digylog_token, webhook_code, created_at`,
				[username, email, password_hash, digylog_token ?? null, webhook_code]
			);
			const user  = rows[0];
			const token = fastify.jwt.sign({ id: user.id, username: user.username, email: user.email, is_admin: user.is_admin });
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
