"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { Order } from "../lib/types";
import { messages } from "../lib/langs/messages";
import { useLang } from "../lib/hooks/useLang";
import { getToken } from "../lib/cookies/get_token";
import { getOrdersFromTrackings } from "../getPostOrders/orders";
import { deleteMyOrder, getMyOrders } from "../lib/orders/myOrders";
import { checkDigylogToken } from "../lib/data/check_digylog_token";

export function useOrders(user_id: number | undefined)
{
	// ============= State =============
	const [orders, setOrders] = useState<Order[]>([]);
	const [refresh_orders, setRefreshOrders] = useState<boolean>(true);
	const [loading_orders, setLoadingOrders] = useState<boolean>(true);
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState("all");
	const { lang, toggleLang, lang_loading } = useLang();
	const t = messages[lang];
	const [page, setPage] = useState(1);
	const [check_digylog_token, setCheckDigylogToken] = useState<boolean | null>(null);
	const [return_loading, setReturnLoading] = useState<boolean>(false);
	const perPage = 10;

	const FILTERS: { label: string; value: string }[] =
	[
		{ label: t.filterAll, value: "all" },
		{ label: t.filterDelivered, value: "delivered" },
		{ label: t.filterReturned, value: "returned" },
		{ label: t.myOrder, value: "my_order" },
	];

	useEffect(() =>
	{
		async function checkUserDigylogToken()
		{
			const digylog_token = await checkDigylogToken();
			if (!digylog_token)
				return (setCheckDigylogToken(false), null);	
			else
				setCheckDigylogToken(true);
		}
		checkUserDigylogToken();
	}, []);

	// ============= Init =============
	useEffect(() =>
	{
		async function init()
		{
			const token = await getToken();
			if (!token)
				return ;
			setLoadingOrders(true);
			try
			{
				const url = user_id === undefined ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me` : `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/users/${user_id}`
				const res = await fetch(url,
				{
					method: "GET",
					headers: { Authorization: `Bearer ${token}`, },
				});
				if (!res.ok)
					return ;

				const user = await res.json();
				let digylog_orders = null;
				if (user.digylog_token)
					digylog_orders = await getOrdersFromTrackings(token, user_id);
				const my_orders = await getMyOrders(user_id);
				const all_orders =
				[
					...my_orders.map((o: any) => ({ ...o, isMyOrder: true, tracking: String(o.id), createdAt: o.createdat, days_ago: Math.floor((Date.now() - new Date(o.createdat).getTime()) / (1000 * 60 * 60 * 24)) })),
					...(digylog_orders ?? []).map((o: any) => ({ ...o, isMyOrder: false,})),
				];
	 	 	 	all_orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	 	 	 	setOrders(all_orders);
			}
			catch {}
			finally
			{
				setLoadingOrders(false);
			}
		}

		init();
	}, [refresh_orders]);

	// ============= Delete Order =============
	async function handleDeleteOrder(id: number)
	{
		const toastId = toast.loading(t.deleting);

		try
		{
			await deleteMyOrder(user_id, id);

			toast.update(toastId,
			{
			 	render: t.orderDeleted,
			 	type: "success",
			 	isLoading: false,
			 	autoClose: 3000,
			});
			setRefreshOrders(!refresh_orders);
		} 
		catch (err: any)
		{
			toast.update(toastId,
			{
			 	render: err.message || t.deleteFailed,
			 	type: "error",
			 	isLoading: false,
			 	autoClose: 3000,
			});
		}
	}

	// ============= Download Order =============
	const downloadOrder = useCallback(async (tracking: string) =>
	{
		const toastId = toast.loading(t.downloading);

		try
		{
			const res_pdf = await fetch(`/api/downloadOrder${user_id === undefined ? "" : `?user_id=${user_id}`}`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ orders: [tracking], format: "5" }),
			});

			if (!res_pdf.ok)
			{
				toast.update(toastId,
				{
					render: t.labelFailed,
					type: "error",
					isLoading: false,
					autoClose: 3000,
				});
				return ;
			}

			const blob = await res_pdf.blob();
			const url = window.URL.createObjectURL(blob);
			window.open(url, "_blank");

			toast.update(toastId,
			{
				render: t.downloadSuccess,
				type: "success",
				isLoading: false,
				autoClose: 2000,
			});
		}
		catch
		{
			toast.update(toastId,
			{
				render: t.serverError,
				type: "error",
				isLoading: false,
				autoClose: 3000,
			});
		}
	}, []);

	// ============= Download BL =============
	const downloadBl = useCallback(async (bl: number) =>
	{
		if (bl === 0)
			return ;
		const toastId = toast.loading(t.downloading);

		try
		{
			const res = await fetch(`/api/order/downloadBl/${bl}${user_id === undefined ? "" : `?user_id=${user_id}`}`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});
			if (!res.ok)
			{
				toast.update(toastId,
				{
					render: t.labelFailed,
					type: "error",
					isLoading: false,
					autoClose: 3000,
				});
				return ;
			}

			const blob = await res.blob();
			const url = window.URL.createObjectURL(blob);
			window.open(url, "_blank");

			toast.update(toastId,
			{
				render: t.downloadSuccess,
				type: "success",
				isLoading: false,
				autoClose: 2000,
			});
		}
		catch
		{
			toast.update(toastId,
			{
				render: t.serverError,
				type: "error",
				isLoading: false,
				autoClose: 3000,
			});
		}
	}, []);

	// ============= Send Order =============
	const sendOrder = useCallback(async (tracking: string, status_id: number) =>
	{
		if (status_id !== 0)
			return ;
		const toastId = toast.loading(t.sending);

		try
		{
			const res = await fetch(`/api/order/send${user_id === undefined ? "" : `?user_id=${user_id}`}`,
			{
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ orders: [tracking] }),
			});

			const data = await res.json();

			if (!res.ok)
			{
				toast.update(toastId,
				{
					render: data?.message ?? t.sendFailed,
					type: "error",
					isLoading: false,
					autoClose: 3000,
				});
				return ;
			}

			setRefreshOrders(!refresh_orders);

			toast.update(toastId,
			{
				render: t.sendSuccess,
				type: "success",
				isLoading: false,
				autoClose: 3000,
			});
		}
		catch
		{
			toast.update(toastId,
			{
				render: t.serverError,
				type: "error",
				isLoading: false,
				autoClose: 3000,
			});
		}
	}, [refresh_orders]);

	// ============= Return Order =============
	const returnOrder = useCallback(async (user_id: number | undefined, tracking: string) =>
	{
		setReturnLoading(true);
		try
		{
			const res = await fetch(`/api/returnOrder${user_id !== undefined ? `?user_id=${user_id}` : ""}`,
			{
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({tracking}),
			});
			const data = await res.json();
			if (!res.ok)
				return (toast.error(data.error));
			toast.success(t.returnReq);
		}
		catch
		{
			toast.error(t.returnReqFailed)
		}
		finally
		{
			setReturnLoading(false);
		}
	}, []);

	// ============= Refresh =============
	const refreshOrdersList = useCallback(() =>
	{
		setRefreshOrders(!refresh_orders);
	}, [refresh_orders]);

	// ============= Filter & Pagination =============
	const filtered = orders.filter((o) =>
	{
		const matchSearch =
			(o.tracking ?? "").toLowerCase().includes(search.toLowerCase()) ||
			o.name.toLowerCase().includes(search.toLowerCase()) ||
			o.city.toLowerCase().includes(search.toLowerCase()) ||
			o.phone.toLowerCase().includes(search.toLowerCase());

		const matchFilter =
			filter === "all" ||
			(o.idStatus === 6 && filter === "delivered") ||
			((o.idStatus === 8 || o.idStatus === 10 || o.idStatus === 11 || o.idStatus === 30 || o.idStatus === 32 || o.idStatus === 40 || o.idStatus === 41 || o.idStatus === 78 || o.idStatus === 79 || o.idStatus === 81) && filter === "returned") ||
			(o.isMyOrder && filter === "my_order");

		return (matchSearch && matchFilter);
	});

	const totalPages = Math.ceil(filtered.length / perPage);
	const paginated = filtered.slice((page - 1) * perPage, page * perPage);

	const stats =
	{
		total: orders.length,
		delivered: orders.filter((o) => o.idStatus === 6).length,
		returned: orders.filter((o) =>
			o.idStatus === 8 ||
			o.idStatus === 10 ||
			o.idStatus === 11 ||
			o.idStatus === 30 ||
			o.idStatus === 32 ||
			o.idStatus === 40 ||
			o.idStatus === 41 ||
			o.idStatus === 78 ||
			o.idStatus === 79 ||
			o.idStatus === 81
		).length,
	};

	// ============= Return =============
	return {
		// State
		loading_orders,
		refresh_orders,
		search,
		filter,
		page,
		filtered,
		paginated,
		totalPages,
		perPage,
		stats,
		lang_loading,
		t,
		lang,
		FILTERS,
		check_digylog_token,
		return_loading,

		// Actions
		setSearch,
		setFilter,
		setPage,
		refreshOrdersList,
		downloadOrder,
		downloadBl,
		sendOrder,
		toggleLang,
		handleDeleteOrder,
		setRefreshOrders,
		returnOrder,
	};
}
