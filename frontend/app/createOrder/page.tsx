"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faStore, faNetworkWired, faUser, faPhone, faLocationDot, faCity, faDollarSign, faBoxOpen, faFileAlt, faHashtag, faL } from "@fortawesome/free-solid-svg-icons";
import { useCreateOrder } from "./useCreateOrder";
import LoadingPage from "../loading";
import Header from "../header";
import DigylogTokenError from "./DigylogTokenError";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuth } from "../lib/auth/auth";
import { ToastContainer } from 'react-toastify';

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
		<div className="min-h-screen bg-[#F0F2FF]" dir={lang === "ar" ? "rtl" : "ltr"}>
			<ToastContainer position="top-right" rtl={lang === "ar"} />
			<Header t={t} lang={lang} namePage={t.createOrder} toggleLang={toggleLang}/>
				<main className="p-5 xl:w-1/2 xl:mx-auto">
					<form onSubmit={handleSubmit} className="space-y-4">

						{/* Order Mode Selection */}
						<div className="bg-white rounded-2xl p-5 shadow-sm">
							<p className="uppercase text-xs font-bold text-[#505F76] tracking-widest mb-3">{t.orderMode}</p>
							<div className="flex bg-[#F0F2FF] rounded-xl p-1">
								<button
									type="button"
									onClick={() => setIsDigyLog(true)}
									className={`flex-1 py-2 rounded-lg text-base font-semibold transition-all duration-300 cursor-pointer ${is_digylog ? "bg-white text-[#4F46E5] shadow-sm" : "text-[#505F76]"}`}
								>
									{t.standardOrder}
								</button>
								<button
									type="button"
									onClick={() => setIsDigyLog(false)}
									className={`flex-1 py-2 rounded-lg text-base font-semibold transition-all duration-300 cursor-pointer ${!is_digylog ? "bg-white text-[#4F46E5] shadow-sm" : "text-[#505F76]"}`}
								>
									{t.yourOrder}
								</button>
							</div>
						</div>
						{((is_digylog && check_digylog_token === true) || !is_digylog)  && (
							<div className="space-y-4">
								{/* Settings Card */}
								<div hidden={!is_digylog} className="bg-white rounded-2xl p-5 shadow-sm space-y-4">

							{/* Network */}
							<div>
								<p className="text-base font-semibold text-[#505F76] mb-2">{t.logisticsNetwork}</p>
								<div className="flex items-center gap-2 border border-gray-200 rounded-xl p-3">
									<FontAwesomeIcon className="text-[#505F76]" icon={faNetworkWired} />
									<select
										value={network}
										onChange={(e) => setNetwork(Number(e.target.value))}
										className="w-full outline-none text-base font-semibold bg-transparent cursor-pointer"
									>
										{networks.map((n) => (
											<option key={n.id} value={n.id}>{n.name}</option>
										))}
									</select>
								</div>
							</div>

							{/* Store */}
							<div>
								<p className="text-base font-semibold text-[#505F76] mb-2">{t.originStore}</p>
								<div className="flex items-center gap-2 border border-gray-200 rounded-xl p-3">
									<FontAwesomeIcon className="text-[#505F76]" icon={faStore} />
									<select
										value={store}
										onChange={(e) => setStore(e.target.value)}
										className="w-full outline-none text-base font-semibold bg-transparent cursor-pointer"
									>
										{stores.map((s) => (
											<option key={s.id} value={s.name}>{s.name}</option>
										))}
									</select>
								</div>
							</div>

							{/* Delivery Mode */}
							<div>
								<p className="uppercase text-xs font-bold text-[#505F76] tracking-widest mb-3">{t.deliveryMode}</p>
								<div className="flex bg-[#F0F2FF] rounded-xl p-1">
									<button
										type="button"
										onClick={() => setMode(1)}
										className={`flex-1 py-2 rounded-lg text-base font-semibold transition-all duration-300 cursor-pointer ${mode === 1 ? "bg-white text-[#4F46E5] shadow-sm" : "text-[#505F76]"}`}
									>
										{t.withoutAgency}
									</button>
									<button
										type="button"
										onClick={() => setMode(2)}
										className={`flex-1 py-2 rounded-lg text-base font-semibold transition-all duration-300 cursor-pointer ${mode === 2 ? "bg-white text-[#4F46E5] shadow-sm" : "text-[#505F76]"}`}
									>
										{t.viaAgency}
									</button>
								</div>

								{mode === 2 && (
									<div className="mt-4">
										<p className="text-base font-semibold text-[#505F76] mb-2">{t.fulfillmentCenter}</p>
										<div className={`flex items-center gap-2 border rounded-xl p-3 ${submitted && mode === 2 && !fc_id ? "border-red-400" : "border-gray-200"}`}>
											<FontAwesomeIcon className="text-[#505F76]" icon={faStore} />
											<select
												value={fc_id}
												onChange={(e) => setFcId(Number(e.target.value))}
												className={`w-full outline-none text-base font-semibold bg-transparent cursor-pointer ${submitted && mode === 2 && !fc_id ? "text-red-400" : ""}`}
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
							<div className="border-t border-gray-100 pt-4 space-y-3">
								<div className="flex justify-between items-center">
									<div>
										<p className="font-semibold text-base">{t.autoSend}</p>
										<p className="text-xs text-[#505F76]">{t.autoSendDesc}</p>
									</div>
									<button
										type="button"
										onClick={() => setAutoSend(!auto_send)}
										className={`w-12 h-6 rounded-full transition-all duration-300 cursor-pointer relative ${auto_send ? "bg-[#4F46E5]" : "bg-gray-200"}`}
									>
										<div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${auto_send ? "left-7" : "left-1"}`}></div>
									</button>
								</div>

								<div className="flex justify-between items-center">
									<div>
										<p className="font-semibold text-base">{t.dupCheck}</p>
										<p className="text-xs text-[#505F76]">{t.dupCheckDesc}</p>
									</div>
									<button
										type="button"
										onClick={() => setDupCheck(!dup_check)}
										className={`w-12 h-6 rounded-full transition-all duration-300 cursor-pointer relative ${dup_check ? "bg-[#4F46E5]" : "bg-gray-200"}`}
									>
										<div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${dup_check ? "left-7" : "left-1"}`}></div>
									</button>
								</div>
							</div>
								</div>

								{/* Orders List */}
								{orders.map((order, index) => (
							<div key={order.id} className="bg-white rounded-2xl shadow-sm border-l-4 border-[#4F46E5] overflow-hidden">
								<div className="p-5 space-y-4">

									{/* Order Header */}
									<div className="flex justify-between items-center">
										<div className="flex items-center gap-2">
											<div className="w-7 h-7 rounded-full bg-[#E2DFFF] text-[#4F46E5] flex items-center justify-center text-base font-bold">
												{index + 1}
											</div>
											<h3 className="text-lg font-bold">{t.orderDetails}</h3>
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
											<p className="text-xs font-semibold text-[#505F76] mb-1">{t.referenceNum}</p>
											<div className={`flex items-center gap-2 border rounded-xl p-3 ${submitted && !order.num.trim() ? "border-red-400" : "border-gray-200"}`}>
												<FontAwesomeIcon className="text-gray-400 text-xs" icon={faHashtag} />
												<input
													value={order.num}
													onChange={(e) => updateOrder(order.id, "num", e.target.value)}
													className="w-full outline-none text-base"
													placeholder="ORD-001"
												/>
											</div>
										</div>

										<div hidden={!is_digylog}>
											<p className="text-xs font-semibold text-[#505F76] mb-1">{t.type}</p>
											<select
												value={order.type}
												onChange={(e) => updateOrder(order.id, "type", Number(e.target.value))}
												className="w-full border border-gray-200 rounded-xl p-3 outline-none text-base cursor-pointer"
											>
												<option value={1}>{t.delivery}</option>
												<option value={2}>{t.exchange}</option>
											</select>
										</div>
									</div>

									{/* Name */}
									<div>
										<p className="text-xs font-semibold text-[#505F76] mb-1">{t.fullName}</p>
										<div className={`flex items-center gap-2 border rounded-xl p-3 ${submitted && !order.name.trim() ? "border-red-400" : "border-gray-200"}`}>
											<FontAwesomeIcon className="text-gray-400" icon={faUser} />
											<input
												value={order.name}
												onChange={(e) => updateOrder(order.id, "name", e.target.value)}
												className="w-full outline-none text-base"
												placeholder="Younes Oubellal"
											/>
										</div>
									</div>

									{/* Phone */}
									<div>
										<p className="text-xs font-semibold text-[#505F76] mb-1">{t.phone}</p>
										<div className={`flex items-center gap-2 border rounded-xl p-3 ${submitted && !order.phone.trim() ? "border-red-400" : "border-gray-200"}`}>
											<FontAwesomeIcon className="text-gray-400" icon={faPhone} />
											<input
												value={order.phone}
												onChange={(e) => updateOrder(order.id, "phone", e.target.value)}
												className="w-full outline-none text-base"
												placeholder="0694250007"
											/>
										</div>
									</div>

									{/* Address */}
									<div>
										<p className="text-xs font-semibold text-[#505F76] mb-1">{t.address}</p>
										<div className={`flex gap-2 border rounded-xl p-3 ${submitted && !order.address.trim() ? "border-red-400" : "border-gray-200"}`}>
											<FontAwesomeIcon className="text-gray-400 mt-1" icon={faLocationDot} />
											<textarea
												value={order.address}
												onChange={(e) => updateOrder(order.id, "address", e.target.value)}
												className="w-full outline-none text-base resize-none"
												placeholder="Address GH1"
												rows={2}
											/>
										</div>
									</div>

									{/* City & Price */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										<div>
											<p className="text-xs font-semibold text-[#505F76] mb-1">{t.city}</p>
											<div className="relative items-center gap-2 border border-gray-200 rounded-xl p-3">
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
													className="w-full outline-none text-base"
													placeholder={t.typeCityName}/>
												{showCities && filteredCities.length > 0 && (
													<div className="absolute z-50 w-full bg-gray-100 border border-white rounded-xl shadow-lg mt-3 left-0 max-h-48 overflow-y-auto">
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
																className="w-full text-start px-4 py-2.5 text-sm hover:bg-[#F0F2FF] transition-colors">
																{c.name}
															</button>
														))}
													</div>
												)}
											</div>
										</div>

										<div>
											<p className="text-xs font-semibold text-[#505F76] mb-1">{t.price}</p>
											<div className="flex items-center gap-2 border border-gray-200 rounded-xl p-3">
												<FontAwesomeIcon className="text-gray-400 text-xs" icon={faDollarSign} />
												<input
													value={order.price}
													onChange={(e) => updateOrder(order.id, "price", e.target.value)}
													className="w-full outline-none text-base"
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
											className="w-4 h-4 accent-[#4F46E5] cursor-pointer"
										/>
										<p className="text-base font-semibold">{t.openProduct}</p>
									</div>

									{/* Port */}
									<div hidden={!is_digylog} className="flex bg-[#F0F2FF] rounded-xl p-1">
										<button
											type="button"
											onClick={() => updateOrder(order.id, "port", 1)}
											className={`flex-1 py-2 rounded-lg text-base font-semibold transition-all duration-300 cursor-pointer ${order.port === 1 ? "bg-white text-[#4F46E5] shadow-sm" : "text-[#505F76]"}`}
										>
											{t.customerPays}
										</button>
										<button
											type="button"
											onClick={() => updateOrder(order.id, "port", 2)}
											disabled={mode === 2}
											className={`flex-1 py-2 rounded-lg text-base font-semibold transition-all duration-300 cursor-pointer ${order.port === 2 ? "bg-white text-[#4F46E5] shadow-sm" : "text-[#505F76]"} ${mode === 2 ? "opacity-40 cursor-not-allowed" : ""}`}
										>
											{t.sellerPays}
										</button>
									</div>

									{mode === 2 && (
										<p className="text-xs text-orange-500 font-semibold mt-1">{t.modeWarning}</p>
									)}

									{/* Products */}
									<div className="bg-[#F8F9FF] rounded-xl p-4">
										<div className="flex justify-between items-center mb-3">
											<div className="flex items-center gap-2">
												<FontAwesomeIcon className="text-[#505F76]" icon={faBoxOpen} />
												<p className="font-semibold text-base">{t.products}</p>
											</div>
											<button
												type="button"
												onClick={() => addProduct(order.id)}
												className="text-[#4F46E5] font-semibold text-base cursor-pointer hover:underline"
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
														className={`w-[25%] border rounded-lg p-2 outline-none text-base bg-white ${submitted && !product.designation.trim() ? "border-red-400" : "border-gray-200"}`}
														placeholder={t.ref}
													/>
													<input
														value={product.designation}
														onChange={(e) => updateProduct(order.id, product_index, "designation", e.target.value)}
														className={`w-[80%] border rounded-lg p-2 outline-none text-base bg-white ${submitted && !product.designation.trim() ? "border-red-400" : "border-gray-200"}`}
														placeholder={t.designation}
													/>
													<input
														value={product.quantity}
														onChange={(e) => updateProduct(order.id, product_index, "quantity", e.target.value)}
														className={`w-[20%] border rounded-lg p-2 outline-none text-base bg-white text-center ${submitted && Number(product.quantity) < 1 ? "border-red-400" : "border-gray-200"}`}
														type="number"
														min={1}
														placeholder={t.qty}
													/>
													{order.refs.length > 1 && (
														<button
															type="button"
															onClick={() => removeProduct(order.id, product_index)}
															className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
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
										<p className="text-xs font-semibold text-[#505F76] mb-1">{t.deliveryNote}</p>
										<div className="flex gap-2 border border-gray-200 rounded-xl p-3">
											<FontAwesomeIcon className="text-gray-400 mt-1" icon={faFileAlt} />
											<textarea
												value={order.note}
												onChange={(e) => updateOrder(order.id, "note", e.target.value)}
												className="w-full outline-none text-base resize-none"
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
									className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-[#4F46E5] hover:text-[#4F46E5] transition-all duration-300 text-gray-400"
								>
									<FontAwesomeIcon className="text-2xl" icon={faPlus} />
									<p className="font-semibold">{t.addAnotherOrder}</p>
								</button>

								{/* Submit */}
								<button
									type="submit"
									className="w-full bg-[#4F46E5] text-white rounded-2xl p-4 font-bold text-lg cursor-pointer hover:bg-[#4338CA] transition-all duration-300 hover:shadow-xl mb-5"
								>
									{t.submitOrders}
								</button>
							</div>
						) || <DigylogTokenError lang={lang}/>}
					</form>
				</main>
		</div>
	);
}
