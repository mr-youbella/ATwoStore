import { getDigylogTokenFromUser } from "@/app/lib/data/get_digylog_token";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> })
{
	const { id }  = await params;
	const token = await getDigylogTokenFromUser();

	const digyRes = await fetch(`https://api.digylog.com/api/v2/seller/pickup/${id}/cancel`,
	{
		method: "PUT",
		headers:
		{
			"Accept":        "application/json",
			"Referer":       "https://apiseller.digylog.com",
			"Authorization": `Bearer ${token}`,
		},
	});

	if (!digyRes.ok)
	{
		const data = await digyRes.json();
		return NextResponse.json(data, { status: digyRes.status });
	}
	return Response.json({ success: true });
}
