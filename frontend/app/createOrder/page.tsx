"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faStore, faNetworkWired, faUser, faPhone, faLocationDot, faCity, faDollarSign, faBoxOpen, faFileAlt, faHashtag, } from "@fortawesome/free-solid-svg-icons";
import { useCreateOrder } from "./useCreateOrder";
import LoadingPage from "../loading";
import Header from "../header";
import DigylogTokenError from "../lib/components/DigylogTokenError";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuth } from "../lib/auth/auth";
import { ToastContainer } from 'react-toastify';
import AddTrackings from "../lib/components/add_trackings";

export default function CreateOrder()
{
	const router = useRouter();
	const { lang, toggleLang, lang_loading, t, is_digylog, setIsDigyLog, mode, setMode, fc_id, setFcId, fcs, network, setNetwork, store, setStore, auto_send, setAutoSend, dup_check, setDupCheck, submitted, networks, stores, cities, orders, check_digylog_token, addOrder, removeOrder, updateOrder, addProduct, removeProduct, updateProduct, handleSubmit }
		= useCreateOrder();
	const [auth_loading, setAuthLoading] = useState(true);
	const [showCities, setShowCities] = useState(false);
	const [citySearch, setCitySearch] = useState("");
	const filteredCities = cities.filter((c: any) => (c.name.toLowerCase().includes(citySearch.toLowerCase()))).sort((a, b) => (a.name.localeCompare(b.name)));;
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

	if (lang_loading || auth_loading || (is_digylog && check_digylog_token === null))
		return (<LoadingPage />);
	return (
		<div className="min-h-screen bg-[#0F172A]" dir={lang === "ar" ? "rtl" : "ltr"}>
			<ToastContainer closeOnClick position="top-right" rtl={lang === "ar"} />
			<Header lang={lang} name_page={t.createOrder} toggleLang={toggleLang}/>
				<main className="p-5 xl:w-1/2 xl:mx-auto">
					<form onSubmit={handleSubmit} className="space-y-4">

						{/* Order Mode Selection */}
						<div className="bg-[#1E293B] rounded-2xl p-5 shadow-sm">
							<p className="uppercase text-xs font-bold text-[#94A3B8] tracking-widest mb-3">{t.orderMode}</p>
							<div className="flex bg-[#0F172A] rounded-xl p-1">
								<button
									type="button"
									onClick={() => setIsDigyLog(true)}
									className={`flex-1 py-2 rounded-lg text-base font-semibold transition-all duration-300 cursor-pointer ${is_digylog ? "bg-[#10B981] text-white shadow-sm" : "text-[#94A3B8]"}`}
								>
									{t.standardOrder}
								</button>
								<button
									type="button"
									onClick={() => setIsDigyLog(false)}
									className={`flex-1 py-2 rounded-lg text-base font-semibold transition-all duration-300 cursor-pointer ${!is_digylog ? "bg-[#10B981] text-white shadow-sm" : "text-[#94A3B8]"}`}
								>
									{t.yourOrder}
								</button>
							</div>
						</div>
						{((is_digylog && check_digylog_token === true) || !is_digylog)  && (
							<div className="space-y-4">
								{/* Settings Card */}
								<div hidden={!is_digylog} className="bg-[#1E293B] rounded-2xl p-5 shadow-sm space-y-4">

							{/* Network */}
							<div>
								<p className="text-base font-semibold text-[#94A3B8] mb-2">{t.logisticsNetwork}</p>
								<div className="flex items-center gap-2 border border-[#334155] rounded-xl p-3">
									<FontAwesomeIcon className="text-[#94A3B8]" icon={faNetworkWired} />
									<select
										value={network}
										onChange={(e) => setNetwork(Number(e.target.value))}
										className="w-full outline-none text-base font-semibold bg-transparent text-[#FFFFFF] cursor-pointer"
									>
										{networks.map((n) => (
											<option key={n.id} value={n.id}>{n.name}</option>
										))}
									</select>
								</div>
							</div>

							{/* Store */}
							<div>
								<p className="text-base font-semibold text-[#94A3B8] mb-2">{t.originStore}</p>
								<div className="flex items-center gap-2 border border-[#334155] rounded-xl p-3">
									<FontAwesomeIcon className="text-[#94A3B8]" icon={faStore} />
									<select
										value={store}
										onChange={(e) => setStore(e.target.value)}
										className="w-full outline-none text-base font-semibold bg-transparent text-[#FFFFFF] cursor-pointer"
									>
										{stores.map((s) => (
											<option key={s.id} value={s.name}>{s.name}</option>
										))}
									</select>
								</div>
							</div>

							{/* Delivery Mode */}
							<div>
								<p className="uppercase text-xs font-bold text-[#94A3B8] tracking-widest mb-3">{t.deliveryMode}</p>
								<div className="flex bg-[#0F172A] rounded-xl p-1">
									<button
										type="button"
										onClick={() => setMode(1)}
										className={`flex-1 py-2 rounded-lg text-base font-semibold transition-all duration-300 cursor-pointer ${mode === 1 ? "bg-[#10B981] text-white shadow-sm" : "text-[#94A3B8]"}`}
									>
										{t.withoutAgency}
									</button>
									<button
										type="button"
										onClick={() => setMode(2)}
										className={`flex-1 py-2 rounded-lg text-base font-semibold transition-all duration-300 cursor-pointer ${mode === 2 ? "bg-[#10B981] text-white shadow-sm" : "text-[#94A3B8]"}`}
									>
										{t.viaAgency}
									</button>
								</div>

								{mode === 2 && (
									<div className="mt-4">
										<p className="text-base font-semibold text-[#94A3B8] mb-2">{t.fulfillmentCenter}</p>
										<div className={`flex items-center gap-2 border rounded-xl p-3 ${submitted && mode === 2 && !fc_id ? "border-red-400" : "border-[#334155]"}`}>
											<FontAwesomeIcon className="text-[#94A3B8]" icon={faStore} />
											<select
												value={fc_id}
												onChange={(e) => setFcId(Number(e.target.value))}
												className={`w-full outline-none text-base font-semibold bg-transparent cursor-pointer ${submitted && mode === 2 && !fc_id ? "text-red-400" : "text-[#FFFFFF]"}`}
											>
												<option value="">{t.selectFulfillmentCenter}</option>
												{fcs.map((fc) => (
													<option key={fc.id} value={fc.id}>{fc.name}</option>
												))}
											</select>
										</div>
									</div>
								)}
							</div>

							{/* Auto Send & Duplicate Check */}
							<div className="border-t border-[#334155] pt-4 space-y-3">
								<div className="flex justify-between items-center">
									<div>
										<p className="font-semibold text-base text-[#FFFFFF]">{t.autoSend}</p>
										<p className="text-xs text-[#94A3B8]">{t.autoSendDesc}</p>
									</div>
									<button
										type="button"
										onClick={() => setAutoSend(!auto_send)}
										className={`w-12 h-6 rounded-full transition-all duration-300 cursor-pointer relative ${auto_send ? "bg-[#10B981]" : "bg-[#334155]"}`}
									>
										<div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${auto_send ? "left-7" : "left-1"}`}></div>
									</button>
								</div>

								<div className="flex justify-between items-center">
									<div>
										<p className="font-semibold text-base text-[#FFFFFF]">{t.dupCheck}</p>
										<p className="text-xs text-[#94A3B8]">{t.dupCheckDesc}</p>
									</div>
									<button
										type="button"
										onClick={() => setDupCheck(!dup_check)}
										className={`w-12 h-6 rounded-full transition-all duration-300 cursor-pointer relative ${dup_check ? "bg-[#10B981]" : "bg-[#334155]"}`}
									>
										<div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${dup_check ? "left-7" : "left-1"}`}></div>
									</button>
								</div>
							</div>
								</div>

								{/* Orders List */}
								{orders.map((order, index) => (
							<div key={order.id} className="bg-[#1E293B] rounded-2xl shadow-sm border-l-4 border-[#10B981] overflow-hidden">
								<div className="p-5 space-y-4">

									{/* Order Header */}
									<div className="flex justify-between items-center">
										<div className="flex items-center gap-2">
											<div className="w-7 h-7 rounded-full bg-[#0F2E2A] text-[#10B981] flex items-center justify-center text-base font-bold">
												{index + 1}
											</div>
											<h3 className="text-lg font-bold text-[#FFFFFF]">{t.orderDetails}</h3>
										</div>
										{orders.length > 1 && (
											<button
												type="button"
												onClick={() => removeOrder(order.id)}
												className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
											>
												<FontAwesomeIcon icon={faTrash} />
											</button>
										)}
									</div>

									{/* Order Fields */}
									<div className="grid grid-cols-2 gap-3">
										<div hidden={!is_digylog}>
											<p className="text-xs font-semibold text-[#94A3B8] mb-1">{t.referenceNum}</p>
											<div className={`flex items-center gap-2 border rounded-xl p-3 ${submitted && !order.num.trim() ? "border-red-400" : "border-[#334155]"}`}>
												<FontAwesomeIcon className="text-[#94A3B8] text-xs" icon={faHashtag} />
												<input
													value={order.num}
													onChange={(e) => updateOrder(order.id, "num", e.target.value)}
													className="w-full outline-none text-base bg-transparent text-[#FFFFFF]"
													placeholder="ORD-001"
												/>
											</div>
										</div>

										<div hidden={!is_digylog}>
											<p className="text-xs font-semibold text-[#94A3B8] mb-1">{t.type}</p>
											<select
												value={order.type}
												onChange={(e) => updateOrder(order.id, "type", Number(e.target.value))}
												className="w-full border border-[#334155] rounded-xl p-3 outline-none text-base cursor-pointer bg-[#0F172A] text-[#FFFFFF]"
											>
												<option value={1}>{t.delivery}</option>
												<option value={2}>{t.exchange}</option>
											</select>
										</div>
									</div>

									{/* Name */}
									<div>
										<p className="text-xs font-semibold text-[#94A3B8] mb-1">{t.fullName}</p>
										<div className={`flex items-center gap-2 border rounded-xl p-3 ${submitted && !order.name.trim() ? "border-red-400" : "border-[#334155]"}`}>
											<FontAwesomeIcon className="text-[#94A3B8]" icon={faUser} />
											<input
												value={order.name}
												onChange={(e) => updateOrder(order.id, "name", e.target.value)}
												className="w-full outline-none text-base bg-transparent text-[#FFFFFF]"
												placeholder="Younes Oubellal"
											/>
										</div>
									</div>

									{/* Phone */}
									<div>
										<p className="text-xs font-semibold text-[#94A3B8] mb-1">{t.phone}</p>
										<div className={`flex items-center gap-2 border rounded-xl p-3 ${submitted && !order.phone.trim() ? "border-red-400" : "border-[#334155]"}`}>
											<FontAwesomeIcon className="text-[#94A3B8]" icon={faPhone} />
											<input
												value={order.phone}
												onChange={(e) => updateOrder(order.id, "phone", e.target.value)}
												className="w-full outline-none text-base bg-transparent text-[#FFFFFF]"
												placeholder="0694250007"
											/>
										</div>
									</div>

									{/* Address */}
									<div>
										<p className="text-xs font-semibold text-[#94A3B8] mb-1">{t.address}</p>
										<div className={`flex gap-2 border rounded-xl p-3 ${submitted && !order.address.trim() ? "border-red-400" : "border-[#334155]"}`}>
											<FontAwesomeIcon className="text-[#94A3B8] mt-1" icon={faLocationDot} />
											<textarea
												value={order.address}
												onChange={(e) => updateOrder(order.id, "address", e.target.value)}
												className="w-full outline-none text-base resize-none bg-transparent text-[#FFFFFF]"
												placeholder="Address GH1"
												rows={2}
											/>
										</div>
									</div>

									{/* City & Price */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										<div>
											<p className="text-xs font-semibold text-[#94A3B8] mb-1">{t.city}</p>
											<div className={`relative items-center gap-2 border ${submitted && !order.city.trim() ? "border-red-400" : "border-[#334155]"} rounded-xl p-3`}>
												<input
													value={citySearch}
													onChange={(e) =>
													{
														setCitySearch(e.target.value);
														setShowCities(true);
														updateOrder(order.id, "city", e.target.value);
													}}
													onFocus={() => setShowCities(true)}
													onBlur={() => setShowCities(false)}
													className="w-full outline-none text-base bg-transparent text-[#FFFFFF]"
													placeholder={t.typeCityName}/>
												{showCities && filteredCities.length > 0 && (
													<div className="absolute z-50 w-full bg-[#1E293B] border border-[#334155] rounded-xl shadow-lg mt-3 left-0 max-h-48 overflow-y-auto">
														{filteredCities.map((c: any) => (
															<button
																key={c.id}
																type="button"
																onMouseDown={() =>
																{
																	updateOrder(order.id, "city", c.name);
																	setCitySearch(c.name);
																	setShowCities(false);
																}}
																className="w-full text-start px-4 py-2.5 text-sm text-[#FFFFFF] hover:bg-[#0F172A] transition-colors">
																{c.name}
															</button>
														))}
													</div>
												)}
											</div>
										</div>

										<div>
											<p className="text-xs font-semibold text-[#94A3B8] mb-1">{t.price}</p>
											<div className="flex items-center gap-2 border border-[#334155] rounded-xl p-3">
												<FontAwesomeIcon className="text-[#94A3B8] text-xs" icon={faDollarSign} />
												<input
													value={order.price}
													onChange={(e) => updateOrder(order.id, "price", e.target.value)}
													className="w-full outline-none text-base bg-transparent text-[#FFFFFF]"
													type="number"
													min={0}
													placeholder="0.00"
												/>
											</div>
										</div>
									</div>

									{/* Open Product */}
									<div hidden={!is_digylog} className="flex items-center gap-3">
										<input
											type="checkbox"
											checked={order.openproduct}
											onChange={(e) => updateOrder(order.id, "openproduct", e.target.checked)}
											className="w-4 h-4 accent-[#10B981] cursor-pointer"
										/>
										<p className="text-base font-semibold text-[#FFFFFF]">{t.openProduct}</p>
									</div>

									{/* Port */}
									<div hidden={!is_digylog} className="flex bg-[#0F172A] rounded-xl p-1">
										<button
											type="button"
											onClick={() => updateOrder(order.id, "port", 1)}
											className={`flex-1 py-2 rounded-lg text-base font-semibold transition-all duration-300 cursor-pointer ${order.port === 1 ? "bg-[#10B981] text-white shadow-sm" : "text-[#94A3B8]"}`}
										>
											{t.customerPays}
										</button>
										<button
											type="button"
											onClick={() => updateOrder(order.id, "port", 2)}
											disabled={mode === 2}
											className={`flex-1 py-2 rounded-lg text-base font-semibold transition-all duration-300 cursor-pointer ${order.port === 2 ? "bg-[#10B981] text-white shadow-sm" : "text-[#94A3B8]"} ${mode === 2 ? "opacity-40 cursor-not-allowed" : ""}`}
										>
											{t.sellerPays}
										</button>
									</div>

									{mode === 2 && (
										<p className="text-xs text-orange-500 font-semibold mt-1">{t.modeWarning}</p>
									)}

									{/* Products */}
									<div className="bg-[#0F172A] rounded-xl p-4">
										<div className="flex justify-between items-center mb-3">
											<div className="flex items-center gap-2">
												<FontAwesomeIcon className="text-[#94A3B8]" icon={faBoxOpen} />
												<p className="font-semibold text-base text-[#FFFFFF]">{t.products}</p>
											</div>
											<button
												type="button"
												onClick={() => addProduct(order.id)}
												className="text-[#10B981] font-semibold text-base cursor-pointer hover:underline"
											>
												{t.addItem}
											</button>
										</div>

										<div className="space-y-2">
											{order.refs.map((product, product_index) => (
												<div key={product_index} className="flex gap-2 items-center">
													<input
														hidden={!is_digylog}
														value={product.ref}
														onChange={(e) => updateProduct(order.id, product_index, "ref", e.target.value)}
														className={`w-[25%] border rounded-lg p-2 outline-none text-base bg-[#1E293B] text-[#FFFFFF] ${submitted && !product.designation.trim() ? "border-red-400" : "border-[#334155]"}`}
														placeholder={t.ref}
													/>
													<input
														value={product.designation}
														onChange={(e) => updateProduct(order.id, product_index, "designation", e.target.value)}
														className={`w-[80%] border rounded-lg p-2 outline-none text-base bg-[#1E293B] text-[#FFFFFF] ${submitted && !product.designation.trim() ? "border-red-400" : "border-[#334155]"}`}
														placeholder={t.designation}
													/>
													<input
														value={product.quantity}
														onChange={(e) => updateProduct(order.id, product_index, "quantity", e.target.value)}
														className={`w-[20%] border rounded-lg p-2 outline-none text-base bg-[#1E293B] text-[#FFFFFF] text-center ${submitted && Number(product.quantity) < 1 ? "border-red-400" : "border-[#334155]"}`}
														type="number"
														min={1}
														placeholder={t.qty}
													/>
													{order.refs.length > 1 && (
														<button
															type="button"
															onClick={() => removeProduct(order.id, product_index)}
															className="text-[#94A3B8] hover:text-red-500 transition-colors cursor-pointer"
														>
															<FontAwesomeIcon icon={faTrash} />
														</button>
													)}
												</div>
											))}
										</div>
									</div>

									{/* Note */}
									<div hidden={!is_digylog}>
										<p className="text-xs font-semibold text-[#94A3B8] mb-1">{t.deliveryNote}</p>
										<div className="flex gap-2 border border-[#334155] rounded-xl p-3">
											<FontAwesomeIcon className="text-[#94A3B8] mt-1" icon={faFileAlt} />
											<textarea
												value={order.note}
												onChange={(e) => updateOrder(order.id, "note", e.target.value)}
												className="w-full outline-none text-base resize-none bg-transparent text-[#FFFFFF]"
												placeholder={t.notePlaceholder}
												rows={3}
											/>
										</div>
									</div>

								</div>
							</div>
								))}

								{/* Add Another Order */}
								<button
									type="button"
									onClick={addOrder}
									className="w-full border-2 border-dashed border-[#334155] rounded-2xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-[#10B981] hover:text-[#10B981] transition-all duration-300 text-[#94A3B8]"
								>
									<FontAwesomeIcon className="text-2xl" icon={faPlus} />
									<p className="font-semibold">{t.addAnotherOrder}</p>
								</button>

								{/* Submit */}
								<button
									type="submit"
									className="w-full bg-[#10B981] text-white rounded-2xl p-4 font-bold text-lg cursor-pointer hover:bg-[#059669] transition-all duration-300 hover:shadow-xl mb-5"
								>
									{t.submitOrders}
								</button>
							</div>
						) || <DigylogTokenError lang={lang}/>}
					</form>
					<AddTrackings lang={lang} setRefreshOrders={null} refresh_orders={null} check_digylog_token={check_digylog_token} />
				</main>
		</div>
	);
}
