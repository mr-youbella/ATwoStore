import { getDigylogTokenFromUser, getDigylogTokenFromUserID } from "@/app/lib/data/get_digylog_token";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ bl: string }> })
{
	const { searchParams } = new URL(req.url);
	const { bl } = await params;
	const bl_number = Number(bl);
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

	try
	{
		const res = await fetch(`https://api.digylog.com/api/v2/seller/bl/${bl_number}/pdf`,
		{
			method: "GET",
			headers:
			{
				"Referer": "https://apiseller.digylog.com",
				"Content-Type": "application/json",
				"Accept": "application/pdf",
				"Authorization": `Bearer ${token}`
			},
		});
		if (!res.ok)
			return Response.json({ error: "Failed to generate PDF" }, { status: 500 });
		const pdfBuffer = await res.arrayBuffer();
		return new Response(pdfBuffer, { status: 200, headers:
		{
			"Content-Type": "application/pdf",
			"Content-Disposition": 'inline; filename="labels.pdf"',
		}});
	}
	catch (error)
	{
		return Response.json({ error: "Failed to generate PDF" }, { status: 500 });
	}
}
