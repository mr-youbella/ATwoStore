import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest)
{
	const { digylog_token } = await req.json();

	if (!digylog_token?.trim())
		return NextResponse.json({ valid: false, error: "Token is required" }, { status: 400 });
	try
	{
		const res = await fetch("https://api.digylog.com/api/v2/seller/networks",
		{
			headers:
			{
				"Accept":        "application/json",
				"Referer":       "https://apiseller.digylog.com",
				"Authorization": `Bearer ${digylog_token}`,
			},
		});

		if (res.ok)
			return NextResponse.json({ valid: true });
		else
			return NextResponse.json({ valid: false, error: "Invalid token" });
	}
	catch
	{
		return NextResponse.json({ valid: false, error: "Server error" }, { status: 500 });
	}
}
