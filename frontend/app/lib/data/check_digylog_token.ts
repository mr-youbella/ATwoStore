import { getToken } from "../cookies/get_token";

export async function checkDigylogToken(): Promise<string | null>
{
	const token = await getToken();
	if (!token)
		return (null);
	try {
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
		const digylog_token = data.digylog_token || null;
		const response = await fetch("/api/checkDigylogToken",
		{
			method:  "POST",
			headers: { "Content-Type": "application/json" },
			body:    JSON.stringify({ digylog_token: digylog_token }),
		});
		const check = await response.json();
		if (!response.ok || !check.valid)
			return (null);
		return (digylog_token);
	}
	catch 
	{
		return (null);
	}
}
