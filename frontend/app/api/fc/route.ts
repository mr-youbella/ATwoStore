import { getDigylogTokenFromUser } from "@/app/lib/data/get_digylog_token";
import { NextRequest } from "next/server";

export async function GET()
{
	const token = await getDigylogTokenFromUser();

	const res  = await fetch("https://api.digylog.com/api/v2/seller/fc",
	{
		headers:
		{
			"Accept": "application/json",
			"Referer": "https://apiseller.digylog.com",
			"Authorization": `Bearer ${token}`,
		},
	});
	if (!res.ok)
		return (Response.json({ message: "error" }, { status: 400 }));
	const data = await res.json();
	return (Response.json(data));
}
