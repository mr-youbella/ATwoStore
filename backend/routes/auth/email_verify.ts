import bcrypt from "bcrypt";
import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance)
{
	fastify.post("/emailVerification", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		try
		{
			const { code } = req.body as { code: string; };
			const user_id = req.user.id;

			if (!code)
				return (reply.status(400).send({ success: false, error: "user Id and code are required.", }));

			const codeHash = await bcrypt.hash(code, 10);
			const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

			await fastify.pg.query(`DELETE FROM email_verifications WHERE user_id = $1`, [user_id]);
			await fastify.pg.query(`INSERT INTO email_verifications (user_id, code_hash, expires_at) VALUES ($1, $2, $3)`, [user_id, codeHash, expiresAt]);

			return (reply.status(201).send({ success: true, message: "Verification code saved.", }));
		}
		catch (error)
		{
			return (reply.status(500).send({ success: false, error: "Failed to save verification code.", }));
		}
	});

	fastify.post("/verifyEmail", { onRequest: [fastify.authenticate] }, async (req: any, reply) =>
	{
		try
		{
			const user_id = req.user.id;
			const { code } = req.body as { code: string };
			const { rows } = await fastify.pg.query(`SELECT code_hash, expires_at FROM email_verifications WHERE user_id = $1`, [user_id]);

			if (rows.length === 0)
				return (reply.status(404).send({ success: false, error: "Verification code not found.", }));
			const verification = rows[0];

			if (new Date() > verification.expires_at)
				return (reply.status(400).send({ success: false, error: "Verification code has expired.", }));

			const isValid = await bcrypt.compare( code, verification.code_hash);

			if (!isValid)
				return (reply.status(400).send({ success: false, error: "Invalid verification code.",}));

			await fastify.pg.query(`UPDATE users SET email_verified = TRUE WHERE id = $1`, [user_id]);
			await fastify.pg.query(`DELETE FROM email_verifications WHERE user_id = $1`, [user_id]);
			return (reply.send({ success: true, message: "Email verified successfully.", }));
		}
		catch (error)
		{
			return (reply.status(500).send({ success: false, error: "Internal server error.", }));
		}
	});
}
