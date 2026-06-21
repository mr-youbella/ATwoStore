import { cookies } from "next/headers";
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
let cachedDigylogToken: string | null = null;

async function getToken()
{
	const cookieStore = await cookies();
	return cookieStore.get("token")?.value ?? null;
}

export async function getDigylogTokenFromUser(): Promise<string | null>
{
	if (cachedDigylogToken)
		return (cachedDigylogToken);
	const token = await getToken();
	if (!token)
		return null;
	try
	{
		const res = await fetch(`${API_URL}/auth/me`,
		{
			headers:
			{
				"Authorization": `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});
		if (!res.ok)
			return null;
		const user = await res.json();
		cachedDigylogToken = user.digylog_token || null;
		return user.digylog_token || null;
	}
	catch
	{
		return null;
	}
}
