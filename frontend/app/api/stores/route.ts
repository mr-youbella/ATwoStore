import { getDigylogTokenFromUser } from "@/app/lib/data/get_digylog_token";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest)
{
	const token = await getDigylogTokenFromUser();

	const res  = await fetch("https://api.digylog.com/api/v2/seller/stores",
	{
		headers:
		{
			"Accept": "application/json",
			"Referer": "https://apiseller.digylog.com",
			"Authorization": `Bearer ${token}`,
		},
	});
	const data = await res.json();
	return Response.json(data);
}
