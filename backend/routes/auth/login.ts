import { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";

export default async function login(fastify: FastifyInstance)
{
	fastify.post<{ Body: { identifier: string; password: string } }>("/auth/login",
	{
		schema:
		{
			body:
			{
				type: "object",
				required: ["identifier", "password"],
				properties:
				{
					identifier: { type: "string" },
					password:   { type: "string" },
				},
			},
		},
	}, async (req, reply) =>
	{
		const { identifier, password } = req.body;
		try
		{
			const { rows } = await fastify.pg.query("SELECT * FROM users WHERE username = $1 OR email = $1", [identifier]);
			if (!rows.length)
				return (reply.code(401).send({ error: "Invalid identifier or password" }));

			const user  = rows[0];
			if (user.provider === "google" || !user.password_hash)
				return (reply.code(401).send({ error: "This account used Google sign-in" }));

			const match = await bcrypt.compare(password, user.password_hash);
			if (!match)
				return (reply.code(401).send({ error: "Invalid identifier or password" }));

			const token = fastify.jwt.sign({ id: user.id, username: user.username, email: user.email });
			return (reply.send({ token, user: { id: user.id, username: user.username, email: user.email, is_admin: user.is_admin } }));
		}
		catch (err)
		{
			throw err;
		}
	});
}
