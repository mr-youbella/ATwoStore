"use client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQrcode, faPrint, faChevronDown, faChevronUp, faSearch, faChevronLeft, faChevronRight, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Fragment } from "react";
import { useRouter } from "next/navigation";
import LoadingPage from "../loading";
import { checkAuth } from "../lib/auth/auth";
import { useOrders } from "./useOrders";
import Header from "../header";
import { ToastContainer } from "react-toastify";

export default function OrdersPage()
{
	const router = useRouter();
	const [auth_loading, setAuthLoading] = useState(true);
	const { loading_orders, search, filter, page, expanded, filtered, paginated, totalPages, perPage, stats, lang_loading, t, lang, FILTERS, new_tracking, show_add_tracking, adding_tracking, check_digylog_token, setSearch, setFilter, setPage, setExpanded, downloadOrder, downloadBl, sendOrder, toggleLang, handleDeleteOrder, handleAddTracking, setNewTracking, setShowAddTracking }
		= useOrders();
	useEffect(() =>
	{
		async function check()
		{
			const ok = await checkAuth(false, router);
			if (!ok)
				return ;
			setAuthLoading(false);
		}
		check();
	}, []);

	if(lang_loading || auth_loading)
		return <LoadingPage />;
	return (
		<div className="min-h-screen bg-[#F0F2FF]">
			<ToastContainer position="top-right" rtl={lang === "ar"} />
			<Header t={t} lang={lang} namePage={t.orders} toggleLang={toggleLang}/>

			<main className="xl:w-3/4 xl:mx-auto p-5 space-y-4">

				<div className="grid grid-cols-3 gap-3">
					<div className="bg-white rounded-2xl p-4 shadow-sm text-center">
						<p className="text-xs text-[#505F76] font-medium mb-1">{t.totalOrders}</p>
						<p className="text-2xl font-bold text-[#3323CC]">{stats.total}</p>
					</div>
					<div className="bg-white rounded-2xl p-4 shadow-sm text-center">
						<p className="text-xs text-[#505F76] font-medium mb-1">{t.delivered}</p>
						<p className="text-2xl font-bold text-[#0F6E56]">{stats.delivered}</p>
					</div>
					<div className="bg-white rounded-2xl p-4 shadow-sm text-center">
						<p className="text-xs text-[#505F76] font-medium mb-1">{t.returned}</p>
						<p className="text-2xl font-bold text-[#854F0B]">{stats.returned}</p>
					</div>
				</div>
				<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
					<div className="p-4 border-b border-gray-100 space-y-3">
						<div className="flex items-center gap-3">
							<div className="relative flex-1 max-w-xs">
								<FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
								<input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full border border-gray-200 rounded-xl py-2 pr-9 pl-3 text-sm outline-none focus:border-[#4F46E5]" placeholder={t.searchPlaceholder}/>
							</div>
						</div>

						<div className="flex gap-2 flex-wrap">
							{FILTERS.map((f) => (
								<button
									key={f.value}
									onClick={() => { setFilter(f.value); setPage(1); }}
									className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${filter === f.value ? "bg-[#4F46E5] text-white" : "bg-[#F0F2FF] text-[#505F76] hover:bg-[#E2DFFF]"}`}>
									{f.label}
								</button>
							))}
						</div>
					</div>
					<div className="overflow-x-auto">
						{loading_orders && (
							<div className="w-full">
								<div className="h-1.5 bg-[#F0F2FF] rounded-full overflow-hidden">
									<div className="h-full bg-[#4F46E5] rounded-full animate-progress"></div>
								</div>
							</div>
						)}
						<table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
							<colgroup>
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
								<tr className="border-b border-gray-100 bg-[#F8F9FF]">
									<th className={`text-center text-xs font-semibold text-[#505F76] p-3`}>{t.thTracking}</th>
									<th className={`text-center text-xs font-semibold text-[#505F76] p-3`}>{t.thPrice}</th>
									<th className={`text-center text-xs font-semibold text-[#505F76] p-3`}>{t.thClient}</th>
									<th className={`text-center text-xs font-semibold text-[#505F76] p-3`}>{t.thCity}</th>
									<th className={`text-center text-xs font-semibold text-[#505F76] p-3`}>{t.thCreatedAt}</th>
									<th className={`text-center text-xs font-semibold text-[#505F76] p-3`}>{t.thStatus}</th>
									<th className={`text-center text-xs font-semibold text-[#505F76] p-3`}>{t.thUpdatedAt}</th>
									<th className={`text-center text-xs font-semibold text-[#505F76] p-3`}>{t.thCashStatus}</th>
									<th className={`text-center text-xs font-semibold text-[#505F76] p-3`}>{t.thPaidAt}</th>
									<th className={`text-center text-xs font-semibold text-[#505F76] p-3`}>{t.thActions}</th>
								</tr>
							</thead>
							<tbody>
								
								{paginated.length === 0 && !loading_orders && (
									<tr>
										<td colSpan={10} className="text-center py-12 text-[#505F76] text-sm">{t.noResults}</td>
									</tr>
								)}
								{paginated.map((order, index) => (
									<Fragment key={index}>
										<tr key={order.tracking} className="hover:bg-[#F8F9FF] transition-colors">
											<td className="p-3">
												<div className="flex items-center gap-2 text-[#4F46E5] font-semibold text-xs">
													<button onClick={() => setExpanded(expanded === order.tracking ? null : order.tracking)} className="w-7 h-7 rounded-full bg-[#4F46E5] flex items-center justify-center text-white cursor-pointer hover:bg-[#4338CA] transition-colors">
														<FontAwesomeIcon icon={expanded === order.tracking ? faChevronUp : faChevronDown} className="text-xs" />
													</button>
													<FontAwesomeIcon icon={faQrcode} className="text-xs" />
													{order.tracking}
												</div>
											</td>
											<td className="p-3 font-semibold text-xs">{Number(order.price).toFixed(2)}</td>
											<td className="p-3">
												<p className="font-semibold text-xs truncate">{order.name}</p>
												<p className="text-[#505F76] text-xs">{order.phone}</p>
											</td>
											<td className="p-3 text-xs text-[#505F76]">{order.city}</td>
											<td className="p-3">
												<p className="text-xs font-semibold">{new Date(order.createdAt).toLocaleDateString("en-GB")}</p>
												<p className="text-xs text-[#505F76]">{t.daysAgo(order.days_ago)}</p>
											</td>
											<td onClick={() => (sendOrder(order.tracking, order.idStatus))} className="p-3 text-center">
												<span className={`text-center text-xs px-2 w-full block rounded-lg font-semibold ${order.idStatus === 0 ? "cursor-pointer bg-gray-200" : order.idStatus === 6 || order.isMyOrder ? "bg-green-200" : "bg-yellow-200"}`}>{!order.isMyOrder ? order.status : "Livrée"}</span>
											</td>
											<td className="p-3 text-xs text-[#505F76]">{!order.isMyOrder ? new Date(order.updatedAt).toLocaleString("en-GB") : "-"}</td>
											<td className="p-3">
												{order.cash_status
													? <span className={`text-xs px-2 py-1 rounded-lg font-semibold text-center w-full block bg-[#F1EFE8] text-[#5F5E5A]`}>{order.cash_status}</span>
													: <span className="text-[#505F76]">-</span>
												}
											</td>
											<td className="p-3 text-xs text-[#505F76]">{order.paidAt ? new Date(order.paidAt).toLocaleString("en-GB") : "-"}</td>
											<td className="p-3">
												<div className="flex items-center gap-1">
													<button hidden={order.isMyOrder} onClick={() => (downloadOrder(order.tracking))} className="w-7 h-7 border border-gray-200 rounded-lg flex items-center justify-center text-[#505F76] hover:text-[#0F6E56] hover:border-[#0F6E56] transition-colors cursor-pointer">
														<FontAwesomeIcon icon={faPrint} className="text-xs" />
													</button>
													<button hidden={!order.isMyOrder} onClick={() => (handleDeleteOrder(Number(order.tracking)))} className={`w-7 h-7 border border-gray-200 rounded-lg flex items-center justify-center text-[#505F76] ${order.isMyOrder ? "hover:text-red-500 hover:border-red-500" : "hover:text-[#4F46E5] hover:border-[#4F46E5]"} transition-colors cursor-pointer`}>
														<FontAwesomeIcon icon={faTrash} className="text-xs" />
													</button>
												</div>
											</td>
										</tr>
										{expanded === order.tracking && (
											<tr key={`${order.tracking}-expanded`} className="bg-[#F8F9FF]">
												<td colSpan={10} className="px-6 py-4 border-b border-gray-100">
													<table className="w-full text-xs mb-3" style={{ tableLayout: "fixed" }}>
														<thead>
															<tr className="border-b border-gray-200">
																{!order.isMyOrder && <th className={`text-[#505F76] font-semibold pb-2 ${lang === "ar" ? "text-right" : "text-left"}`}>{t.thStoreName}</th>}
																{!order.isMyOrder && <th className={`text-[#505F76] font-semibold pb-2 ${lang === "ar" ? "text-right" : "text-left"}`}>{t.thBl}</th>}
																{!order.isMyOrder && <th className={`text-[#505F76] font-semibold pb-2 ${lang === "ar" ? "text-right" : "text-left"}`}>{t.thDeliveryCost}</th>}
																<th className={`text-[#505F76] font-semibold pb-2 ${lang === "ar" ? "text-right" : "text-left"}`}>{t.thAddress}</th>
															</tr>
														</thead>
														<tbody>
															<tr>
																{!order.isMyOrder && <td className={`py-2 font-semibold ${lang === "ar" ? "text-right" : "text-left"}`}>{order.store}</td>}
																{!order.isMyOrder && <td onClick={() => downloadBl(order.bl)} className={`p-2 font-semibold border border-[#4F46E5] rounded-md inline-block w-auto mt-1 text-[#4F46E5] hover:bg-[#4e46e52f] ${lang === "ar" ? "text-right" : "text-left"} ${order.bl !== 0 ? "cursor-pointer" : ""}`}>{order.bl}</td>}
																{!order.isMyOrder && <td className={`py-2 font-semibold ${lang === "ar" ? "text-right" : "text-left"}`}>{order.deliveryCost}</td>}
																<td className={`py-2 font-semibold ${lang === "ar" ? "text-right" : "text-left"}`}>{order.address}</td>
															</tr>
														</tbody>
													</table>
													<table className="w-full text-xs" style={{ tableLayout: "fixed" }}>
														<thead>
															<tr className="border-b border-t border-gray-200">
																<th className={`text-[#505F76] font-semibold py-2 ${lang === "ar" ? "text-right" : "text-left"}`}>{t.thProduct}</th>
																<th className={`text-[#505F76] font-semibold py-2 ${lang === "ar" ? "text-right" : "text-left"}`}>{t.thQty}</th>
															</tr>
														</thead>
														<tbody>
															{order.refs.map((r, index) => (
																<tr key={index}>
																	<td className={`py-2 font-semibold ${lang === "ar" ? "text-right" : "text-left"}`}>{r.designation}</td>
																	<td className={`py-2 font-semibold ${lang === "ar" ? "text-right" : "text-left"}`}>{r.quantity}</td>
																</tr>
															))}
														</tbody>
													</table>
												</td>
											</tr>
										)}
									</Fragment>
								))}
							</tbody>
						</table>
					</div>
					<div className="flex items-center justify-between p-4 border-t border-gray-100">
						<p className="text-xs text-[#505F76]">
							{filtered.length === 0 ? "" : t.showing(Math.min((page - 1) * perPage + 1, filtered.length),Math.min(page * perPage, filtered.length),filtered.length)}
						</p>
						<div className="flex items-center gap-1">
							<button
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page === 1}
								className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-[#505F76] hover:border-[#4F46E5] hover:text-[#4F46E5] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
							>
								<FontAwesomeIcon icon={faChevronRight} className="text-xs" />
							</button>
							{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
								<button
									key={p}
									onClick={() => setPage(p)}
									className={`w-8 h-8 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${page === p ? "bg-[#4F46E5] text-white" : "border border-gray-200 text-[#505F76] hover:border-[#4F46E5] hover:text-[#4F46E5]"}`}
								>
									{p}
								</button>
							))}
							<button
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								disabled={page === totalPages}
								className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-[#505F76] hover:border-[#4F46E5] hover:text-[#4F46E5] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
							>
								<FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
							</button>
						</div>
					</div>
				</div>
				{/* Floating Button */}
				<button
					hidden={check_digylog_token ? false : true}
					onClick={() => setShowAddTracking(true)}
					className="fixed bottom-6 right-6 w-14 h-14 bg-[#4F46E5] text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-[#4338CA] transition-all duration-300 hover:scale-110 z-40">
					<FontAwesomeIcon icon={faQrcode} className="text-xl" />
				</button>

				{/* Modal */}
				{show_add_tracking && 
				(
					<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
							<h2 className="text-lg font-bold text-[#1A1A2E]">{t.addTracking}</h2>
							<p className="text-xs text-[#505F76]">{t.addTrackingDesc}</p>
							<textarea
								value={new_tracking}
								onChange={(e) => setNewTracking(e.target.value)}
								className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#4F46E5] font-mono resize-none"
								placeholder={"S3C419D5S\nSC083E91T\nS72E9022T"}
								rows={4}
							/>
							<div className="flex gap-2">
								<button
									onClick={() => { setShowAddTracking(false); setNewTracking(""); }}
									className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-[#505F76] cursor-pointer hover:bg-gray-50">
									{t.cancel}
								</button>
								<button
									onClick={handleAddTracking}
									disabled={adding_tracking || !new_tracking.trim()}
									className="flex-1 bg-[#4F46E5] text-white rounded-xl py-2.5 text-sm font-semibold cursor-pointer hover:bg-[#4338CA] disabled:opacity-60">
									{adding_tracking ? t.adding : t.add}
								</button>
							</div>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
