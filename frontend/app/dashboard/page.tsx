"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBillWave, faTruck, faChartLine, faBoxOpen, faArrowTrendUp, faArrowTrendDown, faStar } from "@fortawesome/free-solid-svg-icons";
import { useLang } from "../lib/hooks/useLang";
import { messages } from "../lib/langs/messages";
import LoadingPage from "../loading";
import { getOrdersFromTrackings } from "../getPostOrders/orders";
import { getToken } from "../lib/cookies/get_token";
import Header from "../header";
import { checkAuth } from "../lib/auth/auth";
import { useRouter } from "next/navigation";
import { getMyOrders } from "../lib/orders/myOrders";

interface Ref
{
	designation: string;
	quantity: number;
}

interface Order
{
	tracking: string;
	price: number;
	name: string;
	phone: string;
	city: string;
	createdAt: string;
	days_ago: number;
	status: string;
	idStatus: number;
	updatedAt: string;
	cash_status?: string;
	paidAt?: string;
	store: string;
	bl: number;
	deliveryCost: number;
	address: string;
	refs: Ref[];
}

export default function DashboardPage()
{
	const router = useRouter();
	const [orders, setOrders] = useState<Order[] | null>(null);
	const [all_orders, setAllOrders] = useState<Order[]>([]);
	const { lang, toggleLang, lang_loading } = useLang();
	const [auth_loading, setAuthLoading] = useState(true);
	const [period, setPeriod] = useState<"month" | "year" | "all">("all");
	const t = messages[lang];
	const period_options: {key: "month" | "year" | "all", label: string}[] =
	[
		{ key: "all", label: t.labelAll },
		{ key: "month", label: t.labelThisMonth },
		{ key: "year", label: t.labelThisYear },
	];
	let	stats = null;
	if (orders)
	{
		stats =
		{
			totalRevenue:   orders.reduce((sum, o) => sum + Number(o.price), 0),
			deductions:	 orders.reduce((sum, o) => sum + Number(o.deliveryCost || 0), 0),
			netProfit:	  orders.reduce((sum, o) => sum + Number(o.price) - (Number(o.deliveryCost) || 0), 0),
			totalProducts:  orders.reduce((sum, o) => sum + o.refs.reduce((s, r) => s + Number(r.quantity), 0), 0),
			avgOrderValue:  orders.length > 0 ? (orders.reduce((sum, o) => sum + Number(o.price), 0) / orders.length).toFixed(2) : 0,
			topProducts:	Object.entries
			(
				orders.reduce<Record<string, number>>((acc, order) =>
				{
					order.refs.forEach(ref => { acc[ref.designation] = (acc[ref.designation] || 0) + ref.quantity; });
					return acc;
				}, {})
			).map(([designation, quantity]) => ({designation, quantity})),
		};
	}

	useEffect(() =>
	{
		async function check()
		{
			const ok = await checkAuth(false, false, router);
			if (!ok)
				return ;
			setAuthLoading(false);
		}
		check();
	}, []);
	
	function filterOrders(newPeriod: "month" | "year" | "all")
	{
		setPeriod(newPeriod);
		if (newPeriod === "all")
		{
			setOrders(all_orders);
			return ;
		}
		const now = new Date();
		setOrders(
			all_orders.filter(order =>
			{
				const date = new Date(order.createdAt);
				if (newPeriod === "month")
				{
					const now = new Date();
					const start_of_this_month = new Date(now.getFullYear(), now.getMonth(), 1);
					return (date >= start_of_this_month && date <= now);
				}
				return (date.getFullYear() === now.getFullYear());
			})
		);
	}
	useEffect(() =>
	{
		async function loadOrders()
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
			const user_digylog_token = await res.json();
			const digylog_token = user_digylog_token.digylog_token || null;
			let digylog_orders = null;
			if (digylog_token)
				digylog_orders = await getOrdersFromTrackings(token);
			const my_orders = await getMyOrders();
			const all_orders =
			[
				...my_orders.map((o: any) => ({ ...o, isMyOrder: true, tracking: String(o.id), createdAt: o.createdat, days_ago: Math.floor((Date.now() - new Date(o.createdat).getTime()) / (1000 * 60 * 60 * 24)) })),
				...(digylog_orders ?? []).map((o: any) => ({ ...o, isMyOrder: false,})),
			];
			const filter_data = all_orders.filter((o) => (o.idStatus === 6 || o.isMyOrder));
			setOrders(filter_data);
			setAllOrders(filter_data);
		}
		loadOrders();
	}, []);

	if(lang_loading || auth_loading)
		return <LoadingPage />;
	return (
		<div className="min-h-screen bg-[#F0F2FF]" dir={lang === "ar" ? "rtl" : "ltr"}>
			{/* Navbar */}
			<Header lang={lang} name_page={t.dashboard} toggleLang={toggleLang}/>

			<main className="xl:w-3/4 xl:mx-auto p-5">

				<div className="flex items-center gap-2 mb-6">
					{period_options.map((item) =>
					(
						<button key={item.key} onClick={() => filterOrders(item.key)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${period === item.key ? "bg-[#4F46E5] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"} cursor-pointer`}>
							{item.label}
						</button>
					))}
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

					{/* Total Revenue */}
					<div className="bg-white rounded-2xl p-5 shadow-sm">
						<div className="flex justify-between items-start mb-4">
							<div className="w-12 h-12 rounded-xl bg-[#E1F5EE] flex items-center justify-center">
								<FontAwesomeIcon icon={faMoneyBillWave} className="text-[#0F6E56] text-lg" />
							</div>
						</div>
						<p className="text-xs font-medium text-[#505F76] mb-1">{t.totalRevenue}</p>
						<p className="text-3xl font-bold text-[#1A1A2E]">{stats ? stats.totalRevenue.toLocaleString("en-US") : "-"} {lang === "ar" ? "درهم" : "DH"}</p>
					</div>

					{/* Deductions */}
					<div className="bg-white rounded-2xl p-5 shadow-sm">
						<div className="flex justify-between items-start mb-4">
							<div className="w-12 h-12 rounded-xl bg-[#FCEBEB] flex items-center justify-center">
								<FontAwesomeIcon icon={faTruck} className="text-[#C0392B] text-lg" />
							</div>
						</div>
						<p className="text-xs font-medium text-[#505F76] mb-1">{t.deductions}</p>
						<p className="text-3xl font-bold text-[#1A1A2E]">{stats ? stats.deductions.toLocaleString("en-US") : "-"} {lang === "ar" ? "درهم" : "DH"}</p>
					</div>

					{/* Net Profit */}
					<div className="bg-[#4F46E5] rounded-2xl p-5 shadow-sm relative overflow-hidden">
						{/* background decoration */}
						<div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/10" />
						<div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-white/5" />

						<div className="flex justify-between items-start mb-4 relative">
							<div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
								<FontAwesomeIcon icon={faChartLine} className="text-white text-lg" />
							</div>
						</div>
						<p className="text-xs font-medium text-white/70 mb-1 relative">{t.netProfit}</p>
						<p className="text-3xl font-bold text-white relative">{stats ? stats.netProfit.toLocaleString("en-US") : "-"} {lang === "ar" ? "درهم" : "DH"}</p>
					</div>

					{/* Total Products */}
					<div className="bg-white rounded-2xl p-5 shadow-sm">
						<div className="flex justify-between items-start mb-4">
							<div className="w-12 h-12 rounded-xl bg-[#E2DFFF] flex items-center justify-center">
								<FontAwesomeIcon icon={faBoxOpen} className="text-[#4F46E5] text-lg" />
							</div>
						</div>
						<p className="text-xs font-medium text-[#505F76] mb-1">{t.totalProducts}</p>
						<p className="text-3xl font-bold text-[#1A1A2E]">{stats ? stats.totalProducts.toLocaleString() : "-"}</p>
						<p className="text-xs text-[#505F76] mt-2">{t.avgOrderValue} {stats ? stats.avgOrderValue.toLocaleString("en-US") : "-"} {lang === "ar" ? "درهم" : "DH"}</p>
					</div>

				</div>

				{/* Top Selling Products */}
				<div className="bg-white rounded-2xl p-5 shadow-sm md:col-span-2 mt-5">
					<h2 className="text-base font-bold text-[#1A1A2E] mb-4">{t.topProducts}</h2>
					<div className="space-y-4">
						{stats && stats.topProducts.sort((a, b) => (b.quantity - a.quantity)).map((product, index) =>
						(
							<div key={index}>
								<div className="flex justify-between items-center mb-1">
									<p className="text-sm font-semibold text-[#1A1A2E]">{product.designation}</p>
									<p className="text-sm font-bold text-[#1A1A2E]">{product.quantity} {lang === "ar" ? "قطعة" : "pcs"}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</main>
		</div>
	);
}
