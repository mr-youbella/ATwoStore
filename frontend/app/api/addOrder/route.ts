import { getDigylogTokenFromUser } from "@/app/lib/data/get_digylog_token";

export async function POST(request: Request)
{
	const body = await request.json();
	const token = await getDigylogTokenFromUser();

	const res = await fetch("https://api.digylog.com/api/v2/seller/orders",
	{
		method: "POST",
		headers:
		{
			"Accept": "application/json",
			"Content-Type": "application/json",
			"Referer": "https://apiseller.digylog.com",
			"Authorization": `Bearer ${token}`,
		},
		body: JSON.stringify(body),
	});
	if (!res.ok)
		return (Response.json({ message: "error" }, { status: 400 }));
	const data = await res.json();
	return Response.json(data);
}
