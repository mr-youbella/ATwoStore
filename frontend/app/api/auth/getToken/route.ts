import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET()
{
	try
	{
		const cookieStore = await cookies();
		const token = cookieStore.get("token")?.value || null;
		return NextResponse.json({ success: true, token: token, }, { status: 200 });
	}
	catch
	{
		return NextResponse.json({ success: false, token: null, message: "Failed to get token", }, { status: 500 });
	}
}
