import { getDigylogTokenFromUser } from "@/app/lib/data/get_digylog_token";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest)
{
	const { orders } = await req.json();
	const token = await getDigylogTokenFromUser();

	const HEADERS =
	{
		"Content-Type": "application/json",
		"Referer": "https://apiseller.digylog.com",
		"Authorization": `Bearer ${token}`,
	};
	const res = await fetch("https://api.digylog.com/api/v2/seller/orders/send",
	{
		method: "PUT",
		headers: HEADERS,
		body: JSON.stringify({ orders }),
	});

	const data = await res.json();
	return NextResponse.json(data, { status: res.status });
}
