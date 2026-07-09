import { getDigylogTokenFromUser, getDigylogTokenFromUserID } from "@/app/lib/data/get_digylog_token";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest)
{
	const { searchParams } = new URL(req.url);
	const user_id = searchParams.get("user_id");
	const { tracking } = await req.json();

	try
	{
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
		const res = await fetch("https://api.digylog.com/api/v2/seller/complaints",
		{
			method: "POST",
			headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
			body: JSON.stringify({tracking, type: 10}),
		});
		const data = await res.json();
		if (!res.ok)
			return (NextResponse.json({error: data.message ? `${data.message} ${data.status ?? ""}` : "Request to return failed"}, {status: 400}));
		return (NextResponse.json({success: true}, {status: 200}));
	}
	catch
	{
		return (NextResponse.json({error: "Request to return failed"}, {status: 400}));
	}
}
