import { getToken } from "../cookies/get_token";

export async function getUsername(): Promise<string | null>
{
	try
	{
		const token = await getToken();
		if (!token)
			return (null);
		const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`,
		{
			headers:
			{
				"Authorization": `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});
		if (!res.ok)
			return (null);
		const data = await res.json();
		return (data.username);
	}
	catch (err)
	{
		return (null);
	}
}

export async function getDigylogToken(): Promise<string | null>
{
	try
	{
		const token = await getToken();
		if (!token)
			return (null);
		const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`,
		{
			headers:
			{
				"Authorization": `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});
		if (!res.ok)
			return (null);
		const data = await res.json();
		return (data.username);
	}
	catch (err)
	{
		return (null);
	}
}

