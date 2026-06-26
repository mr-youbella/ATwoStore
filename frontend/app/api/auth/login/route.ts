import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(request: NextRequest)
{
	try
	{
		const body = await request.json();
		const { identifier, password } = body;

		if (!identifier?.trim() || !password?.trim())
			return NextResponse.json({ error: "Identifier and password are required" }, { status: 400 });

		const res = await fetch(`${BACKEND_URL}/auth/login`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json", },
			body: JSON.stringify({ identifier, password }),
		});

		const data = await res.json();

		if (!res.ok)
			return NextResponse.json({ error: data?.error || "Login failed" }, { status: res.status });

		const cookieStore = await cookies();

		cookieStore.set("token", data.token,
		{
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 60 * 60 * 24 * 7,
			path: "/",
		});

		return NextResponse.json(
		{
			success: true,
			message: "Login successful",
			user: data.user || null,
		}, { status: 200 });
	}
	catch
	{
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}
