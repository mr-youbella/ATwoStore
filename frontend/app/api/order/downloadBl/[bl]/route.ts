import { getDigylogTokenFromUser } from "@/app/lib/data/get_digylog_token";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ bl: string }> })
{
	const { bl } = await params;
	const bl_number = Number(bl);
	const token = await getDigylogTokenFromUser();

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
