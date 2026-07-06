import { getToken } from "../cookies/get_token";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function getMyOrders(user_id: number | undefined)
{
	const jwt = await getToken();
	const URL = user_id === undefined ? `${API_URL}/orders` : `${API_URL}/admin/orders/${user_id}`;
	const res = await fetch(URL,
	{
		method: "GET",
		headers: { "Authorization": `Bearer ${jwt}` }
	});
	if (!res.ok)
		throw new Error("Failed to fetch orders");
	return (await res.json());
}

export async function createMyOrders(orders:  { name: string; phone: string; address: string; city: string; price: number; refs: { designation: string; quantity: number }[]; }[])
{
	const jwt = await getToken();
	const res = await fetch(`${API_URL}/orders`,
	{
		method:  "POST",
		headers: { "Content-Type": "application/json", "Authorization": `Bearer ${jwt}` },
		body:    JSON.stringify({ orders }),
	});
	if (!res.ok)
	{
		const data = await res.json();
		throw new Error(data.error || "Failed to create orders");
	}
	return res.json();
}

export async function deleteMyOrder(id: number)
{
	const jwt = await getToken();
	const res = await fetch(`${API_URL}/orders/${id}`,
	{
		method:  "DELETE",
		headers: { "Authorization": `Bearer ${jwt}` },
	});
	if (!res.ok)
	{
		const data = await res.json();
		throw new Error(data.error || "Failed to delete order");
	}
	return res.json();
}
