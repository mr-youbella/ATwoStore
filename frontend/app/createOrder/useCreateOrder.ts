import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useLang } from "../lib/hooks/useLang";
import { messages } from "../lib/langs/messages";
import { postTracking } from "../getPostOrders/orders";
import { getToken } from "../lib/cookies/get_token";
import { checkDigylogToken } from "../lib/data/check_digylog_token";
import { createMyOrders } from "../lib/orders/myOrders";

interface Refs
{
	ref: string;
	designation: string;
	quantity: number | "";
}

interface Order
{
	id: number;
	num: string;
	type: 1 | 2;
	name: string;
	phone: string;
	address: string;
	city: string;
	price: number | "";
	openproduct: boolean;
	port: 1 | 2;
	refs: Refs[];
	note: string;
}

interface Network
{
	id: number;
	name: string;
}

interface Store
{
	id: number;
	name: string;
}

interface City
{
	id: number;
	name: string;
	nameAr: string;
}

interface Fc
{
	id: number;
	name: string;
}

export function useCreateOrder()
{
	const { lang, toggleLang, lang_loading } = useLang();
	const t = messages[lang];

	// ============= State =============
	const [is_digylog, setIsDigyLog] = useState<boolean>(true);
	const [check_digylog_token, setCheckDigylogToken] = useState<boolean | null>(null);
	const [mode, setMode] = useState<1 | 2>(1);
	const [fc_id, setFcId] = useState<number | "">("");
	const [fcs, setFcs] = useState<Fc[]>([]);
	const [network, setNetwork] = useState<number>();
	const [store, setStore] = useState<string>("");
	const [auto_send, setAutoSend] = useState<boolean>(false);
	const [dup_check, setDupCheck] = useState<boolean>(true);
	const [submitted, setSubmitted] = useState<boolean>(false);
	const [networks, setNetworks] = useState<Network[]>([]);
	const [stores, setStores] = useState<Store[]>([]);
	const [cities, setCities] = useState<City[]>([]);
	const [orders, setOrders] = useState<Order[]>([
	{
		id: 1,
		num: "",
		type: 1,
		name: "",
		phone: "",
		address: "",
		city: "",
		price: "",
		openproduct: true,
		port: 1,
		refs: [{ ref: "", designation: "", quantity: 1 }],
		note: "",
	}]);

	// ============= Effects =============
	useEffect(() =>
	{
		if (!is_digylog)
			return;
		if (networks.length > 0 && stores.length > 0 && cities.length > 0 && fcs.length > 0)
			return;

		async function fetchAll()
		{
			try
			{
				const digylog_token = await checkDigylogToken();
				if (!digylog_token)
					return (setCheckDigylogToken(false), null);
				const [networksRes, storesRes, citiesRes, fcsRes] = await Promise.all([
					networks.length === 0 ? fetch(`/api/networks`) : null,
					stores.length === 0 ? fetch(`/api/stores`) : null,
					cities.length === 0 ? fetch(`/api/cities`) : null,
					fcs.length === 0 ? fetch(`/api/fc`) : null,
				]);

				if (networksRes)
				{
					if (!networksRes.ok)
						toast.error(t.failedNetworks);
					else
					{
						const data = await networksRes.json();
						setNetworks(data);
						setNetwork(data[0].id);
					}
				}

				if (storesRes)
				{
					if (!storesRes.ok)
						toast.error(t.failedStores);
					else
					{
						const data = await storesRes.json();
						setStores(data);
						setStore(data[0].name);
					}
				}

				if (citiesRes)
				{
					if (!citiesRes.ok)
						toast.error(t.failedCities);
					else
					{
						const data = await citiesRes.json();
						setCities(data);
					}
				}

				if (fcsRes)
				{
					if (!fcsRes.ok)
						toast.error(t.failedFcs);
					else
					{
						const data = await fcsRes.json();
						setFcs(data);
					}
				}
				setCheckDigylogToken(true);
			}
			catch
			{
				setCheckDigylogToken(false);
				toast.error(t.serverError);
			}
		}

		fetchAll();
	}, [is_digylog]);

	// ============= Order Functions =============
	function addOrder()
	{
		setOrders((prev) => [
			...prev,
			{
				id: Date.now(),
				num: "",
				type: 1,
				name: "",
				phone: "",
				address: "",
				city: "",
				price: "",
				openproduct: true,
				port: 1,
				refs: [{ ref: "", designation: "", quantity: 1 }],
				note: "",
			},
		]);
	}

	function removeOrder(id: number)
	{
		setOrders((prev) => prev.filter((value) => value.id !== id));
	}

	function updateOrder(id: number, field: keyof Order, v: any)
	{
		setOrders((prev) =>
			prev.map((value) => (value.id === id ? { ...value, [field]: v } : value))
		);
	}

	function addProduct(order_id: number)
	{
		setOrders((prev) =>
			prev.map((value) =>
				value.id === order_id
					? { ...value, refs: [...value.refs, { ref: "", designation: "", quantity: 1 }] }
					: value
			)
		);
	}

	function removeProduct(order_id: number, index: number)
	{
		setOrders((prev) =>
			prev.map((value) =>
				value.id === order_id
					? { ...value, refs: value.refs.filter((_, i) => i !== index) }
					: value
			)
		);
	}

	function updateProduct(order_id: number, index: number, field: keyof Refs, v: any)
	{
		setOrders((prev) =>
			prev.map((value) =>
				value.id === order_id
					? {
							...value,
							refs: value.refs.map((p, i) => (i === index ? { ...p, [field]: v } : p)),
					  }
					: value
			)
		);
	}

	// ============= API Functions =============

	async function handleSubmit(e: React.FormEvent)
	{
		e.preventDefault();

		setSubmitted(true);

		// ============= Validation =============
		for (const [index, order] of orders.entries())
		{
			if (is_digylog && !order.num.trim())
				return toast.error(t.referenceRequired(index + 1));
			if (!order.name.trim())
				return toast.error(t.nameRequired(index + 1));
			if (!order.phone.trim())
				return toast.error(t.phoneRequired(index + 1));
			if (!order.address.trim())
				return toast.error(t.addressRequired(index + 1));
			if (!order.city.trim())
				return toast.error(t.cityRequired(index + 1));

			for (const [product_index, product] of order.refs.entries())
			{
				if (!product.designation.trim())
					return toast.error(t.designationRequired(index + 1, product_index + 1));
				if (Number(product.quantity) < 1)
					return toast.error(t.qtyRequired(index + 1, product_index + 1));
			}
		}

		// ============= Submit =============
		
		const toast_id = toast.loading(t.submitting);
		if (!is_digylog)
		{
			const payload = orders.map(o => ({ ...o,  price: Number(o.price),  refs: o.refs.map(r => ({ designation: r.designation, quantity: Number(r.quantity), })),}));
			try
			{
				await createMyOrders(payload);
				toast.update(toast_id,
				{
					render: t.submitSuccess,
					type: "success",
					isLoading: false,
					autoClose: 3000,
				});
			}
			catch (err: any)
			{
				toast.update(toast_id,
				{
					render: err.message || t.submitFailed,
					type: "error",
					isLoading: false,
					autoClose: 3000,
					style: { whiteSpace: "pre-line" },
				});
			}
			return ;
		}
		const token = await getToken();
		if (!token)
		{
			toast.update(toast_id,
			{
				render: t.loginRequired,
				type: "error",
				isLoading: false,
				autoClose: 3000,
			});
			return ;
		}
		try
		{
			const res = await fetch("/api/addOrder",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					"mode": mode,
					"network": network,
					"fc": fc_id,
					"store": store,
					"status": auto_send,
					"checkDuplicate": dup_check,
					"orders": orders
				}),
			});
			if (!res.ok)
			{
				return toast.update(toast_id,
				{
					render: t.submitFailed,
					type: "error",
					isLoading: false,
					autoClose: 3000,
					style: { whiteSpace: "pre-line" },
				});
			}

			const data = await res.json();

			if (!data[0].isSuccess)
			{
				return toast.update(toast_id,
				{
					render: data?.flatMap((item: any) => item.errors ?? []).join("\n"),
					type: "error",
					isLoading: false,
					autoClose: 3000,
					style: { whiteSpace: "pre-line" },
				});
			}

			await Promise.all(data.map((order: any) => postTracking(order.tracking, token)));
			toast.update(toast_id,
			{
				render: t.submitSuccess,
				type: "success",
				isLoading: false,
				autoClose: 3000,
			});
		}
		catch
		{
			toast.update(toast_id,
			{
				render: t.serverError,
				type: "error",
				isLoading: false,
				autoClose: 3000,
			});
		}
	}

	// ============= Return =============
	return {
		// Language
		lang,
		toggleLang,
		lang_loading,
		t,

		// State
		is_digylog,
		setIsDigyLog,
		mode,
		setMode,
		fc_id,
		setFcId,
		fcs,
		network,
		setNetwork,
		store,
		setStore,
		auto_send,
		setAutoSend,
		dup_check,
		setDupCheck,
		submitted,
		setSubmitted,
		networks,
		stores,
		cities,
		orders,
		check_digylog_token,

		// Order Functions
		addOrder,
		removeOrder,
		updateOrder,
		addProduct,
		removeProduct,
		updateProduct,

		// Handlers
		handleSubmit,
	};
}
