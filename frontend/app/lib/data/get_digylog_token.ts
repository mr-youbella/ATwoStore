import { cookies } from "next/headers";
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function getToken()
{
	const cookieStore = await cookies();
	return cookieStore.get("token")?.value ?? null;
}

export async function getDigylogTokenFromUser(): Promise<string | null>
{
	const token = await getToken();
	if (!token)
		return (null);
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
			return (null);
		const user = await res.json();
		return user.digylog_token || null;
	}
	catch
	{
		return (null);
	}
}

export async function getDigylogTokenFromUserID(user_id: number): Promise<string | null>
{
	const token = await getToken();
	if (!token)
		return (null);
	try
	{
		const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/users/${user_id}`,
		{
			method: "GET",
			headers: { Authorization: `Bearer ${token}`, },
		});
		if (!res.ok)
			return (null);
		const user = await res.json();
		return (user.digylog_token || null);
	}
	catch
	{
		return (null);
	}
}
