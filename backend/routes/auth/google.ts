import { FastifyInstance } from "fastify";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function generateUniqueUsername(fastify: FastifyInstance, baseUsername: string)
{
	let username = baseUsername;
	let counter = 1;

	while (true)
	{
		const { rows } = await fastify.pg.query("SELECT id FROM users WHERE username = $1", [username]);
		if (rows.length === 0)
			return (username);
		username = `${baseUsername}_${counter}`;
		counter++;
	}
}

export default async function loginByGoogle(fastify: FastifyInstance)
{
	fastify.post("/auth/google", async (req, reply) =>
	{
		const { id } = req.body as any;
		const ticket = await client.verifyIdToken({ idToken: id, audience: process.env.GOOGLE_CLIENT_ID,});
		const payload = ticket.getPayload();
  		if (!payload?.email || !payload.email_verified)
    		return reply.code(401).send({ error: "Invalid Google account" });
  		const email = payload.email;

		const name = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_");
		const username = await generateUniqueUsername(fastify, name);

		const { rows } = await fastify.pg.query("SELECT * FROM users WHERE email = $1", [email]);
		let user = rows[0];
		if (!user)
		{
			const result = await fastify.pg.query(`INSERT INTO users (username, email, password_hash, provider) VALUES ($1, $2, NULL, 'google') RETURNING *`, [username, email]);
			user = result.rows[0];
		}

		const token = fastify.jwt.sign({ id: user.id, email: user.email, username: user.username, });
		return (reply.send({ token, user }));
		
	});
}
