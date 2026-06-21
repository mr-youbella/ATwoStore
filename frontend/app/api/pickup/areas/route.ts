import { getDigylogTokenFromUser } from "@/app/lib/data/get_digylog_token";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest)
{
	const token = await getDigylogTokenFromUser();
	const network = req.nextUrl.searchParams.get("network");

	if (!network)
		return NextResponse.json({ error: "network is required" }, { status: 400 });

	const res = await fetch(`https://api.digylog.com/api/v2/seller/pickup/areas?network=${network}`,
	{
		headers:
		{
			"Accept":        "application/json",
			"Referer":       "https://apiseller.digylog.com",
			"Authorization": `Bearer ${token}`,
		},
	});

	const data = await res.json();
	return NextResponse.json(data, { status: res.status });
}
