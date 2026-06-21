import { getToken } from "../cookies/get_token";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const jwt = await getToken();

export async function getMyOrders()
{
	const res = await fetch(`${API_URL}/orders`,
	{
		headers: { "Authorization": `Bearer ${jwt}` }
	});
	if (!res.ok)
		throw new Error("Failed to fetch orders");
	return res.json();
}

export async function createMyOrders(orders:  { name: string; phone: string; address: string; city: string; price: number; refs: { designation: string; quantity: number }[]; }[])
{
	const res = await fetch(`${API_URL}/orders`,
	{
		method:  "POST",
		headers: { "Content-Type": "application/json", "Authorization": `Bearer ${jwt}` },
		body:    JSON.stringify({ orders }),
	});
	if (!res.ok)
	{
		const data = await res.json();
		console.log(data);
		throw new Error(data.error || "Failed to create orders");
	}
	return res.json();
}

export async function deleteMyOrder(id: number)
{
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
