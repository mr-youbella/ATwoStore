import { getDigylogTokenFromUser } from "@/app/lib/data/get_digylog_token";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest)
{
	const token = await getDigylogTokenFromUser();
	const { area, phone } = await req.json();

	if (!area || !phone)
		return NextResponse.json({ error: "area and phone are required" }, { status: 400 });

	const res = await fetch("https://api.digylog.com/api/v2/seller/pickup/request",
	{
		method: "POST",
		headers:
		{
			"Content-Type":  "application/json",
			"Accept":        "application/json",
			"Referer":       "https://apiseller.digylog.com",
			"Authorization": `Bearer ${token}`,
		},
		body: JSON.stringify({ area, phone }),
	});

	const data = await res.json();
	return NextResponse.json(data, { status: res.status });
}
