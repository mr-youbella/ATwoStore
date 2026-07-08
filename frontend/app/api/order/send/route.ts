import { getDigylogTokenFromUser, getDigylogTokenFromUserID } from "@/app/lib/data/get_digylog_token";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest)
{
	const { searchParams } = new URL(req.url);
	const { orders } = await req.json();
	const user_id = searchParams.get("user_id");
	let token;
	if (user_id)
	{
		const id = Number(user_id);

		if (Number.isNaN(id))
			return NextResponse.json({ error: "User ID is not a valid number" }, { status: 400 });
		token = await getDigylogTokenFromUserID(id);
	}
	else
		token = await getDigylogTokenFromUser();

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
