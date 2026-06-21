import { getDigylogTokenFromUser } from "@/app/lib/data/get_digylog_token";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ tracking: string }> })
{
	const { tracking } = await params;
	const token = await getDigylogTokenFromUser();
	const HEADERS =
	{
		"Accept": "application/json",
		"Referer": "https://apiseller.digylog.com",
		"Authorization": `Bearer ${token}`,
	};
	try 
	{
		const [infosRes, refsRes] = await Promise.all([
			fetch(`https://api.digylog.com/api/v2/seller/order/${tracking}/infos`, { headers: HEADERS }),
			fetch(`https://api.digylog.com/api/v2/seller/order/${tracking}/refs`, { headers: HEADERS }),
		]);
		if (!infosRes.ok || !refsRes.ok)
			return NextResponse.json({ error: "Server error" }, { status: 500 });
		const infos = await infosRes.json();
		const refs = await refsRes.json();
		return NextResponse.json({ infos, refs });
	}
	catch (err)
	{
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}
