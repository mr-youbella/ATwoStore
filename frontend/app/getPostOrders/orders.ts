import { Order } from "../lib/types";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function getTrackings(token: string): Promise<string[]>
{
	const response = await fetch(`${API_URL}/digylog_trackings`,
	{
		method: "GET",
		headers:
		{
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		cache: "no-store",
	});

	if (!response.ok)
	{
		throw new Error("Failed to fetch trackings");
	}

	return response.json();
}

async function fetchOrder(tracking: string, digylogToken: string): Promise<Order | null>
{
	const res = await fetch(`/api/order/${tracking}`,
	{
		headers:
		{
			Authorization: `Bearer ${digylogToken}`,
			"Content-Type": "application/json",
		},
	});

	if (!res.ok)
		return null;

	const { infos, refs } = await res.json();

	if (infos.idStatus === 13)
		return null;

	const order: Order =
	{
		tracking: infos.traking,
		price: infos.price,
		name: infos.name,
		phone: infos.phone,
		city: infos.city,
		createdAt: infos.createdAt,
		days_ago: Math.floor((Date.now() - new Date(infos.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
		status: infos.status,
		idStatus: infos.idStatus,
		updatedAt: infos.updatedAt,
		cash_status: infos.cash_status,
		paidAt: infos.paidAt,
		store: infos.store,
		bl: infos.bl,
		deliveryCost: infos.deliveryCost,
		address: infos.address,
		refs: refs.map((r: any) =>
		({
			designation: r.designation,
			quantity: r.quantity,
		})),
	};

	return order;
}

export async function getOrdersFromTrackings(token: string, digylogToken: string): Promise<Order[] | null>
{
	try
	{
		const trackings = await getTrackings(token);
		const orders = await Promise.all(trackings.map((t) => fetchOrder(t, digylogToken)));
		return orders.filter((o): o is Order => o !== null);
	}
	catch
	{
		return null;
	}
}

export async function postTracking(tracking: string, token: string)
{
	const response = await fetch(`${API_URL}/digylog_trackings`,
	{
		method: "POST",
		headers:
		{
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ tracking }),
	});

	const data = await response.json();

	if (!response.ok)
		throw new Error(data.error || "Failed to create tracking");

	return data;
}
