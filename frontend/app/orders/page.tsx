"use client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQrcode, faPrint, faSearch, faChevronLeft, faChevronRight, faTrash, faIdBadge, faArrowRotateLeft, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { Fragment } from "react";
import { useRouter } from "next/navigation";
import LoadingPage from "../loading";
import { checkAuth } from "../lib/auth/auth";
import { useOrders } from "./useOrders";
import Header from "../header";
import { ToastContainer } from "react-toastify";
import AddTrackings from "../lib/components/add_trackings";
import { Order } from "../lib/types";

export default function OrdersPage({ user_id }: { user_id: number | undefined }) {
	const router = useRouter();
	const [auth_loading, setAuthLoading] = useState(true);
	const [selected_order, setSelectedOrder] = useState<Order | null>(null);
	const { loading_orders, search, filter, page, filtered, paginated, totalPages, perPage, stats, check_digylog_token, refresh_orders, lang_loading, t, lang, FILTERS, return_loading, setSearch, setFilter, setPage, downloadOrder, downloadBl, sendOrder, toggleLang, refreshOrdersList, handleDeleteOrder, setRefreshOrders, returnOrder }
		= useOrders(user_id);
	useEffect(() => {
		async function check() {
			const ok = await checkAuth(false, false, router);
			if (!ok)
				return;
			setAuthLoading(false);
		}
		check();
	}, []);
	useEffect(() => {
		document.body.style.overflow = selected_order ? "hidden" : "auto";

		return () => {document.body.style.overflow = "auto";};
	}, [selected_order]);

	if (lang_loading || auth_loading)
		return <LoadingPage />;
	return (
		<div className="min-h-screen bg-[#0F172A]">
			<ToastContainer closeOnClick position="top-right" rtl={lang === "ar"} />
			<Header lang={lang} name_page={t.orders} toggleLang={toggleLang} />

			<main className="xl:w-3/4 xl:mx-auto p-5 space-y-4">

				<div className="grid grid-cols-3 gap-3">
					<div className="bg-[#1E293B] rounded-2xl p-4 shadow-sm text-center">
						<p className="text-xs text-[#94A3B8] font-medium mb-1">{t.totalOrders}</p>
						<p className="text-2xl font-bold text-[#10B981]">{stats.total}</p>
					</div>
					<div className="bg-[#1E293B] rounded-2xl p-4 shadow-sm text-center">
						<p className="text-xs text-[#94A3B8] font-medium mb-1">{t.delivered}</p>
						<p className="text-2xl font-bold text-[#10B981]">{stats.delivered}</p>
					</div>
					<div className="bg-[#1E293B] rounded-2xl p-4 shadow-sm text-center">
						<p className="text-xs text-[#94A3B8] font-medium mb-1">{t.returned}</p>
						<p className="text-2xl font-bold text-[#854F0B]">{stats.returned}</p>
					</div>
				</div>
				<div className="bg-[#1E293B] rounded-2xl shadow-sm overflow-hidden">
					<div className="p-4 border-b border-[#334155] space-y-3">
						<div className="flex items-center gap-3">
							<div className="relative flex-1 max-w-xs">
								<FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-xs" />
								<input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full border border-[#334155] bg-[#0F172A] text-[#FFFFFF] rounded-xl py-2 pr-9 pl-3 text-sm outline-none focus:border-[#10B981]" placeholder={t.searchPlaceholder} />
							</div>
						</div>

						<div className="flex justify-between">
							<div className="flex gap-2 flex-wrap">
								{FILTERS.map((f) => (
									<button
										key={f.value}
										onClick={() => { setFilter(f.value); setPage(1); }}
										className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${filter === f.value ? "bg-[#10B981] text-white" : "bg-[#0F172A] text-[#94A3B8] hover:bg-[#334155]"}`}>
										{f.label}
									</button>
								))}
							</div>
							<button disabled={loading_orders} className="text-white cursor-pointer disabled:cursor-not-allowed disabled:animate-spin" onClick={refreshOrdersList}><FontAwesomeIcon icon={faRefresh}/></button>
						</div>
					</div>
					<div className="overflow-x-auto">
						{loading_orders && (
							<div className="w-full">
								<div className="h-1.5 bg-[#0F172A] rounded-full overflow-hidden">
									<div className="h-full bg-[#10B981] rounded-full animate-progress"></div>
								</div>
							</div>
						)}
						<table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
							<colgroup>
								<col style={{ width: "40px" }} />
								<col style={{ width: "120px" }} />
								<col style={{ width: "70px" }} />
								<col style={{ width: "130px" }} />
								<col style={{ width: "80px" }} />
								<col style={{ width: "110px" }} />
								<col style={{ width: "120px" }} />
								<col style={{ width: "110px" }} />
								<col style={{ width: "140px" }} />
								<col style={{ width: "110px" }} />
								<col style={{ width: "90px" }} />
							</colgroup>
							<thead>
								<tr className="border-b border-[#334155] bg-[#0F172A]">
									<th className="p-3"></th>
									<th className={`text-center text-xs font-semibold text-[#94A3B8] p-3`}>{t.thTracking}</th>
									<th className={`text-center text-xs font-semibold text-[#94A3B8] p-3`}>{t.thPrice}</th>
									<th className={`text-center text-xs font-semibold text-[#94A3B8] p-3`}>{t.thClient}</th>
									<th className={`text-center text-xs font-semibold text-[#94A3B8] p-3`}>{t.thCity}</th>
									<th className={`text-center text-xs font-semibold text-[#94A3B8] p-3`}>{t.thCreatedAt}</th>
									<th className={`text-center text-xs font-semibold text-[#94A3B8] p-3`}>{t.thStatus}</th>
									<th className={`text-center text-xs font-semibold text-[#94A3B8] p-3`}>{t.thUpdatedAt}</th>
									<th className={`text-center text-xs font-semibold text-[#94A3B8] p-3`}>{t.thCashStatus}</th>
									<th className={`text-center text-xs font-semibold text-[#94A3B8] p-3`}>{t.thPaidAt}</th>
									<th className={`text-center text-xs font-semibold text-[#94A3B8] p-3`}>{t.thActions}</th>
								</tr>
							</thead>
							<tbody>
								{paginated.length === 0 && !loading_orders && (
									<tr>
										<td colSpan={11} className="text-center py-12 text-[#94A3B8] text-sm">{t.noResults}</td>
									</tr>
								)}
								{paginated.map((order, index) =>
								(
									<Fragment key={index}>
										<tr className="hover:bg-[#0F172A] transition-colors">
											<td className="p-3">
												<button
													onClick={() => setSelectedOrder(order)}
													className="w-7 h-7 rounded-full bg-[#10B981] flex items-center justify-center text-white cursor-pointer hover:bg-[#059669] transition-colors"
												>
													<FontAwesomeIcon icon={faIdBadge} className="text-xs" />
												</button>
											</td>
											<td className="p-3">
												<div className="flex items-center gap-2 text-[#10B981] font-semibold text-xs">
													<FontAwesomeIcon icon={faQrcode} className="text-xs" />
													{order.tracking}
												</div>
											</td>
											<td className="p-3 font-semibold text-xs text-[#FFFFFF]">{Number(order.price).toFixed(2)}</td>
											<td className="p-3">
												<p className="font-semibold text-xs text-[#FFFFFF] truncate">{order.name}</p>
												<p className="text-[#94A3B8] text-xs">{order.phone}</p>
											</td>
											<td className="p-3 text-xs text-[#94A3B8]">{order.city}</td>
											<td className="p-3">
												<p className="text-xs font-semibold text-[#FFFFFF]">{new Date(order.createdAt).toLocaleDateString("en-GB")}</p>
												<p className="text-xs text-[#94A3B8]">{t.daysAgo(order.days_ago)}</p>
											</td>
											<td onClick={() => (sendOrder(order.tracking, order.idStatus))} className="p-3 text-center">
												<span className={`text-center text-xs px-2 w-full block rounded-lg font-semibold ${order.idStatus === 0 ? "cursor-pointer bg-[#334155] text-[#94A3B8]" : order.idStatus === 6 || order.isMyOrder ? "bg-[#10B981] text-white" : "bg-[#854F0B] text-white"}`}>{!order.isMyOrder ? order.status : "Livrée"}</span>
											</td>
											<td className="p-3 text-xs text-[#94A3B8]">{!order.isMyOrder ? new Date(order.updatedAt).toLocaleString("en-GB") : "-"}</td>
											<td className="p-3">
												{order.cash_status
													? <span className={`text-xs px-2 py-1 rounded-lg font-semibold text-center w-full block bg-[#334155] text-[#94A3B8]`}>{order.cash_status}</span>
													: <span className="text-[#94A3B8]">-</span>
												}
											</td>
											<td className="p-3 text-xs text-[#94A3B8]">{order.paidAt ? new Date(order.paidAt).toLocaleString("en-GB") : "-"}</td>
											<td className="p-3">
												<div className="flex items-center gap-1">
													<button hidden={order.isMyOrder} onClick={() => (downloadOrder(order.tracking))} className="w-7 h-7 border border-[#334155] rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#10B981] hover:border-[#10B981] transition-colors cursor-pointer">
														<FontAwesomeIcon icon={faPrint} className="text-xs" />
													</button>
													<button hidden={!order.isMyOrder} onClick={() => (handleDeleteOrder(Number(order.tracking)))} className={`w-7 h-7 border border-[#334155] rounded-lg flex items-center justify-center text-[#94A3B8] ${order.isMyOrder ? "hover:text-red-500 hover:border-red-500" : "hover:text-[#10B981] hover:border-[#10B981]"} transition-colors cursor-pointer`}>
														<FontAwesomeIcon icon={faTrash} className="text-xs" />
													</button>
												</div>
											</td>
										</tr>
									</Fragment>
								))}
							</tbody>
						</table>
						{selected_order && (
							<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
								<div className="bg-[#1E293B] rounded-2xl shadow-xl w-full max-w-lg space-y-4 p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

									{/* Header */}
									<div className="flex justify-between items-center">
										<button onClick={() => setSelectedOrder(null)} className="text-[#94A3B8] hover:text-[#FFFFFF] cursor-pointer">✕</button>
										<div className="flex items-center gap-2 text-[#10B981] font-bold text-sm">
											<FontAwesomeIcon icon={faQrcode} />
											{selected_order.tracking}
										</div>
									</div>

									{/* Status */}
									<div className="flex justify-center">
										<span className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${selected_order.idStatus === 6 || selected_order.isMyOrder ? "bg-[#10B981] text-white" : "bg-[#854F0B] text-white"}`}>
											{!selected_order.isMyOrder ? selected_order.status : "Livrée"}
										</span>
									</div>

									{/* Info grid */}
									<div className="grid grid-cols-2 gap-3">
										<div className="bg-[#0F172A] rounded-xl p-3">
											<p className="text-xs text-[#94A3B8] mb-1">{t.thClient}</p>
											<p className="font-semibold text-sm text-[#FFFFFF]">{selected_order.name}</p>
											<p className="text-xs text-[#94A3B8]">{selected_order.phone}</p>
										</div>
										<div className="bg-[#0F172A] rounded-xl p-3">
											<p className="text-xs text-[#94A3B8] mb-1">{t.thCity}</p>
											<p className="font-semibold text-sm text-[#FFFFFF]">{selected_order.city}</p>
										</div>
										<div className="bg-[#0F172A] rounded-xl p-3">
											<p className="text-xs text-[#94A3B8] mb-1">{t.thPrice}</p>
											<p className="font-semibold text-sm text-[#FFFFFF]">{Number(selected_order.price).toFixed(2)} DH</p>
										</div>
										<div className="bg-[#0F172A] rounded-xl p-3">
											<p className="text-xs text-[#94A3B8] mb-1">{t.thCreatedAt}</p>
											<p className="font-semibold text-sm text-[#FFFFFF]">{new Date(selected_order.createdAt).toLocaleDateString("en-GB")}</p>
											<p className="text-xs text-[#94A3B8]">{t.daysAgo(selected_order.days_ago)}</p>
										</div>
										{!selected_order.isMyOrder && (
											<>
												<div className="bg-[#0F172A] rounded-xl p-3">
													<p className="text-xs text-[#94A3B8] mb-1">{t.thStoreName}</p>
													<p className="font-semibold text-sm text-[#FFFFFF]">{selected_order.store}</p>
												</div>
												<div className="bg-[#0F172A] rounded-xl p-3">
													<p className="text-xs text-[#94A3B8] mb-1">{t.thDeliveryCost}</p>
													<p className="font-semibold text-sm text-[#FFFFFF]">{selected_order.deliveryCost} DH</p>
												</div>
												<div className="bg-[#0F172A] rounded-xl p-3 col-span-2">
													<p className="text-xs text-[#94A3B8] mb-1">{t.thBl}</p>
													<span
														onClick={() => downloadBl(selected_order.bl)}
														className={`font-semibold text-sm text-[#10B981] border border-[#10B981] px-2 py-0.5 rounded-lg inline-block ${selected_order.bl !== 0 ? "cursor-pointer hover:bg-[#10B981] hover:text-white" : ""}`}
													>
														{selected_order.bl}
														<FontAwesomeIcon className="text-xs ml-1" icon={faPrint}/>
													</span>
												</div>
											</>
										)}
										<div className="bg-[#0F172A] rounded-xl p-3 col-span-2">
											<p className="text-xs text-[#94A3B8] mb-1">{t.thAddress}</p>
											<p className="font-semibold text-sm text-[#FFFFFF]">{selected_order.address}</p>
										</div>
										{selected_order.cash_status && (
											<div className="bg-[#0F172A] rounded-xl p-3 col-span-2">
												<p className="text-xs text-[#94A3B8] mb-1">{t.thCashStatus}</p>
												<span className="text-xs px-2 py-1 rounded-lg font-semibold bg-[#334155] text-[#94A3B8]">{selected_order.cash_status}</span>
											</div>
										)}
									</div>

									{/* Products */}
									<div>
										<p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest mb-2">{t.thProduct}</p>
										<div className="space-y-2">
											{selected_order.refs.map((r, i) => (
												<div key={i} className="flex justify-between items-center bg-[#0F172A] rounded-xl px-4 py-2.5">
													<p className="text-sm font-semibold text-[#FFFFFF]">{r.designation}</p>
													<span className="text-xs bg-[#10B981] text-white px-2 py-0.5 rounded-full font-semibold">×{r.quantity}</span>
												</div>
											))}
										</div>
									</div>

									{/* Actions */}
									{!selected_order.isMyOrder && (
										<>
											<p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest mb-2">{t.thActions}</p>
											<button
												disabled={return_loading}
												onClick={() => (returnOrder(user_id, selected_order.tracking))}
												className="w-full flex items-center justify-center gap-2 bg-[#b92c10] disabled:bg-[#871e09] text-white text-sm font-semibold py-2.5 rounded-xl cursor-pointer disabled:cursor-not-allowed hover:bg-[#961605] transition-colors"
											>
												<FontAwesomeIcon icon={faArrowRotateLeft} />
												{t.returnOrder}
												{return_loading ? " ..." : ""}
											</button>
											<button
												onClick={() => { downloadOrder(selected_order.tracking); }}
												className="w-full flex items-center justify-center gap-2 bg-[#10B981] text-white text-sm font-semibold py-2.5 rounded-xl cursor-pointer hover:bg-[#059669] transition-colors"
											>
												<FontAwesomeIcon icon={faPrint} />
												{t.printLabel}
											</button>
										</>
									)}
								</div>
							</div>
						)}
					</div>
					<div className="flex items-center justify-between p-4 border-t border-[#334155]">
						<p className="text-xs text-[#94A3B8]">
							{filtered.length === 0 ? "" : t.showing(Math.min((page - 1) * perPage + 1, filtered.length), Math.min(page * perPage, filtered.length), filtered.length)}
						</p>
						<div className="flex items-center gap-1">
							<button
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page === 1}
								className="w-8 h-8 border border-[#334155] rounded-lg flex items-center justify-center text-[#94A3B8] hover:border-[#10B981] hover:text-[#10B981] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
							>
								<FontAwesomeIcon icon={faChevronRight} className="text-xs" />
							</button>
							{Array.from({ length: totalPages }, (_, i) => i + 1)
								.filter((p) => {
									if (totalPages <= 4) return true;
									if (page <= 2) return p <= 4;
									if (page >= totalPages - 1) return p >= totalPages - 3;
									return (p >= page - 1 && p <= page + 2);
								})
								.map((p) => (
									<button
										key={p}
										onClick={() => setPage(p)}
										className={`w-8 h-8 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${page === p ? "bg-[#10B981] text-white" : "border border-[#334155] text-[#94A3B8] hover:border-[#10B981] hover:text-[#10B981]"}`}
									>
										{p}
									</button>
								))
							}
							<button
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								disabled={page === totalPages}
								className="w-8 h-8 border border-[#334155] rounded-lg flex items-center justify-center text-[#94A3B8] hover:border-[#10B981] hover:text-[#10B981] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
							>
								<FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
							</button>
						</div>
					</div>
				</div>
				<AddTrackings lang={lang} setRefreshOrders={setRefreshOrders} refresh_orders={refresh_orders} check_digylog_token={check_digylog_token} />
			</main>
		</div>
	);
}
