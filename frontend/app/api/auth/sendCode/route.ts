import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(req: Request)
{
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value || null;
	const code = Math.floor(100000 + Math.random() * 900000).toString();

	try
	{
		const res_me = await fetch(`${BACKEND_URL}/auth/me`,
		{
  			method: "GET",
  			headers: { "Authorization": `Bearer ${token}` },
		});
		const user_data = await res_me.json();
		if (!res_me.ok)
			throw new Error(user_data.error || "Failed get email");
		const email = user_data.email;
	
		const res = await fetch(`${BACKEND_URL}/emailVerification`,
		{
  			method: "POST",
  			headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
  			body: JSON.stringify({ code }),
		});
		const data = await res.json();
		if (!res.ok)
			throw new Error(data.error || "Failed to save verification code");

		const transporter = nodemailer.createTransport
		({
			host: process.env.SMTP_HOST,
			port: Number(process.env.SMTP_PORT),
			secure: false,
			auth:
			{
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			},
		});

		const html_page =
		`
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			    <h2 style="color: #333;">Verify Your Email</h2>
			    <p>Thank you for signing up for <strong>ATwoStore</strong>.</p>
			    <p>Use the verification code below to verify your email address:</p>
			    <div style="margin: 24px 0; padding: 16px; background: #f4f4f5; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px;">
			    	${code}
			    </div>
			    <p>This code will expire in <strong>10 minutes</strong>.</p>
			    <p style="color:#b45309;background:#fef3c7;padding:12px;border-radius:6px;">⚠️ If you didn't request this verification, you can safely ignore this email.</p>
			    <hr />
			    <p style="font-size:12px;color:#6b7280;">© ATwoStore</p>
			</div>
		`;

		await transporter.sendMail
		({
			from: `"ATwoStore" <${process.env.SMTP_USER}>`,
			to: email,
			subject: "Verify Your Email",
			text: `Your ATwoStore verification code is: ${code}. This code will expire in 10 minutes.`,
			html: html_page,
		});

		return NextResponse.json({ success: true });
	}
	catch (error: any)
	{
		return NextResponse.json( { success: false, error: error.message || "Failed to send email" }, { status: 500 });
	}
}
