import { getToken } from "../cookies/get_token";

interface Form
{
	username: string,
	email: string,
	password: string,
	digylog_token: string
}

export async function checkAuth(is_login_page: boolean, is_verify_page: boolean, route: any)
{
	try
	{
		const token = await getToken();
		if (!token)
		{
			if (!is_login_page)
				route.replace("/auth/login");
			return (false);
		}
		const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`,
		{
			headers:
			{
				"Authorization": `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});
		if (!res.ok)
		{
			if (!is_login_page)
				route.replace("/auth/login");
			return (false);
		}
		const data = await res.json();
		if (!data.email_verified && !is_verify_page)
		{
			route.replace("/auth/verify");
			return (false);
		}
	}
	catch (err)
	{
		if (!is_login_page)
			route.replace("/auth/login");
		return (false);
	}
	if (is_login_page)
		route.replace("/home");
	return (true);
}

export async function login(identifier: string, password: string)
{
	const res = await fetch("/api/auth/login",
	{
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ identifier, password }),
	});
	const data = await res.json();
	if (!res.ok)
		throw new Error(data.error || "Login failed");
	return data;
}

export async function register(form: Form)
{
	const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`,
	{
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(form),
	});
	const data = await res.json();
	if (!res.ok)
		throw new Error(data.error || "Register failed");
	return (data);
}
