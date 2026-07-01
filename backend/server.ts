import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import postgres from "@fastify/postgres";
import fastifyJwt from "@fastify/jwt";
import fastifyCors from "@fastify/cors";
import dotenv from "dotenv";
import register from "./routes/auth/register";
import login from "./routes/auth/login";
import me from "./routes/auth/me";
import settings from "./routes/settings";
import digylogTrackings from "./routes/digylog_trackings";
import digylogWebhook from "./routes/digylog_webhook";
import digylogPickups from "./routes/digylog_pickups";
import orders from "./routes/orders";
import emailVerify from "./routes/auth/email_verify";
import google from "./routes/auth/google";

dotenv.config({ path: "./.env.local" });

const fastify = Fastify({ logger: true });

fastify.register(fastifyCors, { origin: process.env.CORS_WEBSITE, methods: ["GET", "POST", "PUT", "DELETE"] });
fastify.register(postgres, { connectionString: process.env.DATABASE_URL });
fastify.register(fastifyJwt, { secret: process.env.JWT_SECRET! });
fastify.register(register);
fastify.register(login);
fastify.register(me);
fastify.register(settings);
fastify.register(digylogTrackings);
fastify.register(digylogWebhook);
fastify.register(digylogPickups);
fastify.register(orders);
fastify.register(emailVerify);
fastify.register(google);

declare module "fastify" { interface FastifyInstance { authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void> } }

fastify.decorate("authenticate", async (req: FastifyRequest, reply: FastifyReply) =>
{
	try
	{
		await req.jwtVerify();
	}
	catch (err)
	{
		return (reply.status(401).send({ error: "Invalid or expired token" }));
	}
});

async function checkDatabaseConnection()
{
	try
	{
		const client = await fastify.pg.connect();
		await client.query("SELECT 1");
		client.release();
		fastify.log.info("✅ Database connected successfully");
	}
	catch (err)
	{
		console.error("❌ Database connection failed:", err);
		process.exit(1);
	}
}

async function start()
{
	try
	{
		await fastify.listen({ port: Number(process.env.PORT), host: "0.0.0.0" });
		fastify.log.info("Server running successfully 🚀");
		await checkDatabaseConnection();
	}
	catch (err)
	{
		fastify.log.error(err);
		process.exit(1);
	}
}

start();
