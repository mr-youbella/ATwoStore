import { getDigylogTokenFromUser, getDigylogTokenFromUserID } from "@/app/lib/data/get_digylog_token";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{tracking: string }> })
{
	const { searchParams } = new URL(req.url);
	const { tracking } = await params;

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
		"Accept": "application/json",
		"Referer": "https://apiseller.digylog.com",
		"Authorization": `Bearer ${token}`,
	};
	try 
	{
		const [infos_res, refs_res] = await Promise.all([
			fetch(`https://api.digylog.com/api/v2/seller/order/${tracking}/infos`, { headers: HEADERS }),
			fetch(`https://api.digylog.com/api/v2/seller/order/${tracking}/refs`, { headers: HEADERS }),
		]);
		if (!infos_res.ok || !refs_res.ok)
			return NextResponse.json({ error: "Server error" }, { status: 500 });
		const infos = await infos_res.json();
		const refs = await refs_res.json();
		return NextResponse.json({ infos, refs });
	}
	catch (err)
	{
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}
