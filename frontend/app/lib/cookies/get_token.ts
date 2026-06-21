export async function getToken(): Promise<string | null>
{
	if (typeof window === "undefined")
		return (null);
	try
	{
		const res = await fetch("/api/auth/getToken",
		{
			method: "GET",
			headers: { "Content-Type": "application/json", },
			cache: "no-store",
		});
		if (!res.ok)
			return (null);
		const data = await res.json();
		return (data.token || null);
	}
	catch
	{
		return (null);
	}
}
