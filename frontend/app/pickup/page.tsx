"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruck, faPhone, faMapMarked, faChevronDown, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Pickup } from "../lib/types";
import { useLang } from "../lib/hooks/useLang";
import { messages } from "../lib/langs/messages";
import LoadingPage from "../loading";
import { getToken } from "../lib/cookies/get_token";
import Header from "../header";
import { checkAuth } from "../lib/auth/auth";
import { checkDigylogToken } from "../lib/data/check_digylog_token";
import DigylogTokenError from "../lib/components/DigylogTokenError";

export default function PickupPage()
{
	const router = useRouter();
	const { lang, toggleLang, lang_loading } = useLang();
	const t = messages[lang];
	const [pickups, setPickups]	 = useState<Pickup[]>([]);
	const [submitted, setSubmitted] = useState(false);
	const [form, setForm]		   = useState({ city: "", region: "", phone: "" });
	const [networks, setNetworks]   = useState<any[]>([]);
	const [areas, setAreas]		 = useState<any[]>([]);
	const [network, setNetwork]	 = useState("");
	const [auth_loading, setAuthLoading]   = useState(true);
	const [check_digylog_token, setCheckDigylogToken] = useState<boolean | null>(null);
	
	const [city_search, setCitySearch] = useState("");
	const [isCityOpen, setIsCityOpen] = useState(false);
	const cityRef = useRef<HTMLDivElement>(null);
	
	const [region_search, setRegionSearch] = useState("");
	const [isRegionOpen, setIsRegionOpen] = useState(false);
	const regionRef = useRef<HTMLDivElement>(null);

	const filteredNetworks = networks.filter((n: any) =>
		n.name.toLowerCase().includes(city_search.toLowerCase())
	);

	const filteredAreas = areas.filter((a: any) =>
		a.name.toLowerCase().includes(region_search.toLowerCase())
	);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
				setIsCityOpen(false);
			}
			if (regionRef.current && !regionRef.current.contains(event.target as Node)) {
				setIsRegionOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

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
	
	useEffect(() =>
	{
		async function checkDigylogTokenIsValid()
		{
			const digylog_token = await checkDigylogToken();
			if (!digylog_token)
				return (setCheckDigylogToken(false), null);
			setCheckDigylogToken(true);
		}
		checkDigylogTokenIsValid();
	}, []);

	useEffect(() =>
	{
		if (check_digylog_token === null || check_digylog_token === false)
			return ;
		async function fetchPickups()
		{
			const jwt = await getToken();
			try
			{
				const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/digylog_pickups`,
				{
					headers: { "Authorization": `Bearer ${jwt}` }
				});
				if (!res.ok)
					return;
				const data = await res.json();
				setPickups(data.map((p: any) => (
				{
					id:		   Number(p.pickup_id),
					area:		 p.area,
					seller_phone: p.seller_phone,
					picker:	   p.picker,
					picker_phone: p.picker_phone,
				})));
			}
			catch { toast.error(t.serverError); }
		}
		fetchPickups();
	}, [check_digylog_token]);

	useEffect(() =>
	{
		if (check_digylog_token === null || check_digylog_token === false)
			return ;
		async function fetchNetworks()
		{
			try
			{
				const res  = await fetch(`/api/networks`);
				const data = await res.json();
				setNetworks(data);
				if (data.length > 0) {
					setNetwork(data[0].id);
					setCitySearch(data[0].name);
					setForm(prev => ({ ...prev, city: data[0].name }));
				}
			}
			catch { toast.error(t.serverError); }
		}
		fetchNetworks();
	}, [check_digylog_token]);

	useEffect(() =>
	{
		if (check_digylog_token === null || check_digylog_token === false)
			return ;
		if (!network)
			return;
		async function fetchAreas()
		{
			try
			{
				const res  = await fetch(`/api/pickup/areas?&network=${network}`);
				const data = await res.json();
				setAreas(data);
				if (data.length > 0) {
					setRegionSearch(data[0].name);
					setForm(prev => ({ ...prev, region: data[0].name }));
				} else {
					setRegionSearch("");
					setForm(prev => ({ ...prev, region: "" }));
				}
			}
			catch { toast.error(t.serverError); }
		}
		fetchAreas();
	}, [network, check_digylog_token]);

	function update(field: string, value: string)
	{
		setForm((prev) => ({ ...prev, [field]: value }));
	}

	const selectCity = (networkId: string, networkName: string) => {
		setNetwork(networkId);
		setCitySearch(networkName);
		setForm(prev => ({ ...prev, city: networkName, region: "" }));
		setRegionSearch("");
		setIsCityOpen(false);
	};

	const selectRegion = (areaName: string) => {
		setRegionSearch(areaName);
		setForm(prev => ({ ...prev, region: areaName }));
		setIsRegionOpen(false);
	};

	const clearCitySearch = () => {
		setCitySearch("");
		setForm(prev => ({ ...prev, city: "" }));
		setNetwork("");
		setIsCityOpen(true);
	};

	const clearRegionSearch = () => {
		setRegionSearch("");
		setForm(prev => ({ ...prev, region: "" }));
		setIsRegionOpen(true);
	};

	async function cancelPickup(id: number)
	{
		const toastId	   = toast.loading(t.cancelling);
		const token 	   = await getToken();
		if (!token)
			return null;
		const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`,
		{
			headers:
			{
				"Authorization": `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});
		if (!res.ok)
			return null;
		
		try
		{
			await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/digylog_pickups/${id}`,
			{
				method:  "DELETE",
				headers: { "Authorization": `Bearer ${token}` },
			});
			const res = await fetch(`/api/pickup/cancel/${id}`,
			{
				method:  "DELETE",
				headers: { "Authorization": `Bearer ${token}` },
			});
			if (!res.ok)
			{
				toast.update(toastId, { render: t.cancelFailed, type: "error", isLoading: false, autoClose: 3000 });
				return;
			}
			setPickups((prev) => prev.filter((p) => p.id !== id));
			toast.update(toastId, { render: t.cancelled, type: "success", isLoading: false, autoClose: 3000 });
		}
		catch
		{
			toast.update(toastId, { render: t.serverError, type: "error", isLoading: false, autoClose: 3000 });
		}
	}

	async function handleSubmit()
	{
		setSubmitted(true);
		if (!form.city.trim() || !form.phone.trim() || !network)
			return;

		const toastId		= toast.loading(t.sending);
		const jwt	   	= await getToken();

		try
		{
			const area_obj = areas.find((a: any) => a.name === form.region);
			if (!area_obj)
			{
				toast.update(toastId, { render: t.regionNotFound, type: "error", isLoading: false, autoClose: 3000 });
				return;
			}

			const res = await fetch(`/api/pickup/request`,
			{
				method:  "POST",
				headers: { "Content-Type": "application/json" },
				body:	JSON.stringify({ area: area_obj?.id, phone: form.phone }),
			});
			const data = await res.json();
			if (!res.ok)
			{
				toast.update(toastId, { render: data?.message ?? t.sendFailed, type: "error", isLoading: false, autoClose: 3000 });
				return;
			}
			await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/digylog_pickups`,
			{
				method:  "POST",
				headers: { "Content-Type": "application/json", "Authorization": `Bearer ${jwt}` },
				body:	JSON.stringify(
				{
					pickup_id:	data.id,
					area:		 data.area,
					seller_phone: data.sellerPhone,
					picker:	   data.picker,
					picker_phone: data.pickerPhone,
				}),
			});
			setPickups((prev) => [...prev,
			{
				id:			  data.id,
				area:		  data.area,
				seller_phone: data.sellerPhone,
				picker:		  data.picker,
				picker_phone: data.pickerPhone,
			}]);
			toast.update(toastId, { render: t.sendSuccess, type: "success", isLoading: false, autoClose: 3000 });
			setForm({ city: "", region: "", phone: "" });
			setNetwork("");
			setAreas([]);
			setCitySearch("");
			setRegionSearch("");
			setSubmitted(false);
		}
		catch
		{
			toast.update(toastId, { render: t.serverError, type: "error", isLoading: false, autoClose: 3000 });
		}
	}

	const invalid = (field: string) => submitted && !form[field as keyof typeof form].trim();

	if(lang_loading || auth_loading || check_digylog_token === null)
		return <LoadingPage />;
	
	return (
		<div className="min-h-screen bg-[#0F172A]" >
			<ToastContainer closeOnClick position="top-right" rtl={lang === "ar"} />

			<Header lang={lang} name_page={t.pickup} toggleLang={toggleLang}/>

			{check_digylog_token === true && (
				<main className="xl:w-3/4 xl:mx-auto p-5">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">

					{/* Left — Pickup list */}
					<div>
						<div className="flex items-center gap-2 mb-4">
							<FontAwesomeIcon icon={faTruck} className="text-[#10B981] text-lg" />
							<h2 className="text-xl font-bold text-[#FFFFFF]">{t.pickupTitle}</h2>
						</div>
						<div className="space-y-4">
							{pickups.map((pickup) =>
							(
								<div key={pickup.id} className="bg-[#1E293B] rounded-2xl p-5 shadow-sm border border-[#334155]">
									<div className="flex justify-between items-start mb-4">
										<FontAwesomeIcon icon={faTruck} className="text-[#94A3B8] text-xl mt-1" />
										<div className={lang === "ar" ? "text-right" : "text-left"}>
											<p className="text-[#10B981] font-bold text-lg">{pickup.area}</p>
											<p className="text-[#94A3B8] text-xs">#{pickup.id}</p>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-4 mb-4">
										<div className={lang === "ar" ? "text-right" : "text-left"}>
											<p className="text-xs text-[#94A3B8] mb-1">{t.sellerPhone}</p>
											<p className="font-bold text-[16px] text-[#FFFFFF]">{pickup.seller_phone}</p>
										</div>
									</div>
									{pickup.picker && (
										<div className="flex items-center gap-2 mb-4">
											<div className="w-10 h-10 rounded-full bg-[#0F2E2A] flex items-center justify-center">
												<FontAwesomeIcon icon={faTruck} className="text-[#10B981] text-[16px]" />
											</div>
											<div className={lang === "ar" ? "text-right" : "text-left"}>
												<p className="text-xs text-[#94A3B8]">{t.driver} {pickup.picker}</p>
												<p className="text-[#10B981] font-bold text-[16px]">{pickup.picker_phone}</p>
											</div>
										</div>
									)}
									<button
										onClick={() => cancelPickup(pickup.id)}
										className="w-full border border-[#334155] rounded-xl py-2.5 text-[#E24B4A] font-semibold text-[16px] cursor-pointer hover:bg-red-50/10 transition-colors">
										{t.cancel}
									</button>
								</div>
							))}
						</div>
					</div>

					{/* Right — New pickup form */}
					<div className="bg-[#1E293B] rounded-2xl p-5 shadow-sm border border-[#334155]">
						<div className="flex justify-between items-center mb-5">
							<h2 className="text-lg font-bold text-[#FFFFFF]">{t.newPickup}</h2>
						</div>
						<div className="space-y-4">

							{/* City - Combobox with Search */}
							<div ref={cityRef}>
								<label className={`block text-xs font-semibold text-[#94A3B8] mb-1 ${lang === "ar" ? "text-right" : "text-left"}`}>{t.city}</label>
								<div className="relative">
									<div className={`flex items-center gap-2 border rounded-xl px-4 py-3 transition-colors ${invalid("city") ? "border-red-400 bg-red-50/10" : "border-[#334155] focus-within:border-[#10B981]"}`}>
										<FontAwesomeIcon icon={faTruck} className="text-[#94A3B8] text-[16px]" />
										<input
											value={city_search}
											onChange={(e) => {
												setCitySearch(e.target.value);
												update("city", e.target.value);
												setIsCityOpen(true);
												if (e.target.value === "")
													setNetwork("");
											}}
											onFocus={() => (setIsCityOpen(true), setCitySearch(""))}
											className={`flex-1 outline-none text-[16px] ${lang === "ar" ? "text-right" : "text-left"} bg-transparent text-[#FFFFFF]`}
											placeholder={t.cityPH}/>
										{city_search && (
											<button
												type="button"
												onClick={clearCitySearch}
												className="text-[#94A3B8] hover:text-[#E24B4A] transition">
												<FontAwesomeIcon icon={faTimes} className="text-[16px]" />
											</button>
										)}
										<FontAwesomeIcon 
											icon={faChevronDown} 
											className={`text-[#94A3B8] text-[16px] transition-transform ${isCityOpen ? "rotate-180" : ""}`} />
									</div>
									
									{isCityOpen && filteredNetworks.length > 0 && (
										<div className="absolute z-50 w-full bg-[#1E293B] border border-[#334155] rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
											{filteredNetworks.map((n: any) => (
												<button
													key={n.id}
													type="button"
													onMouseDown={() => selectCity(n.id, n.name)}
													className={`w-full text-start px-4 py-2.5 text-[16px] text-[#FFFFFF] hover:bg-[#0F172A] transition-colors ${network === n.id ? "bg-[#0F172A] text-[#10B981]" : ""}`}
												>
													{n.name}
												</button>
											))}
										</div>
									)}
									
									{isCityOpen && city_search && filteredNetworks.length === 0 && (
										<div className="absolute z-50 w-full bg-[#1E293B] border border-[#334155] rounded-xl shadow-lg mt-1 p-4 text-center text-[16px] text-[#94A3B8]">
											{t.noCitiesFound}
										</div>
									)}
								</div>
								{invalid("city") && <p className={`text-red-500 text-xs mt-1 ${lang === "ar" ? "text-right" : "text-left"}`}>{t.required}</p>}
							</div>
								
							{/* Region - Combobox with Search */}
							<div ref={regionRef}>
								<label className={`block text-xs font-semibold text-[#94A3B8] mb-1 ${lang === "ar" ? "text-right" : "text-left"}`}>{t.region}</label>
								<div className="relative">
									<div className={`flex items-center gap-2 border rounded-xl px-4 py-3 transition-colors ${!network ? "opacity-50" : ""} ${invalid("region") ? "border-red-400 bg-red-50/10" : "border-[#334155] focus-within:border-[#10B981]"}`}>
										<FontAwesomeIcon icon={faMapMarked} className="text-[#94A3B8] text-[16px]" />
										<input
											value={region_search}
											onChange={(e) => {
												setRegionSearch(e.target.value);
												update("region", e.target.value);
												if (network)
													setIsRegionOpen(true);
											}}
											onFocus={() => {
												if (network)
												{
													setIsRegionOpen(true);
													setRegionSearch("");
												}
											}}
											disabled={!network}
											className={`flex-1 outline-none text-[16px] ${lang === "ar" ? "text-right" : "text-left"} bg-transparent text-[#FFFFFF]`}
											placeholder={t.regionPH}
										/>
										{region_search && network && (
											<button
												type="button"
												onClick={clearRegionSearch}
												className="text-[#94A3B8] hover:text-[#E24B4A] transition"
											>
												<FontAwesomeIcon icon={faTimes} className="text-[16px]" />
											</button>
										)}
										<FontAwesomeIcon 
											icon={faChevronDown} 
											className={`text-[#94A3B8] text-[16px] transition-transform ${isRegionOpen ? "rotate-180" : ""}`} 
										/>
									</div>
									
									{isRegionOpen && filteredAreas.length > 0 && (
										<div className="absolute z-50 w-full bg-[#1E293B] border border-[#334155] rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
											{filteredAreas.map((a: any) => (
												<button
													key={a.id}
													type="button"
													onMouseDown={() => selectRegion(a.name)}
													className="w-full text-start px-4 py-2.5 text-[16px] text-[#FFFFFF] hover:bg-[#0F172A] transition-colors">
													{a.name}
												</button>
											))}
										</div>
									)}
									
									{isRegionOpen && network && region_search && filteredAreas.length === 0 && (
										<div className="absolute z-50 w-full bg-[#1E293B] border border-[#334155] rounded-xl shadow-lg mt-1 p-4 text-center text-[16px] text-[#94A3B8]">
											{t.noAreasFound}
										</div>
									)}
									
									{network && areas.length === 0 && !isRegionOpen && (
										<p className="text-xs text-[#94A3B8] mt-1">{t.noAreasAvailable}</p>
									)}
								</div>
								{invalid("region") && <p className={`text-red-500 text-xs mt-1 ${lang === "ar" ? "text-right" : "text-left"}`}>{t.required}</p>}
							</div>

							{/* Phone */}
							<div>
								<label className={`block text-xs font-semibold text-[#94A3B8] mb-1 ${lang === "ar" ? "text-right" : "text-left"}`}>{t.phone}</label>
								<div className={`flex items-center gap-2 border rounded-xl px-4 py-3 transition-colors ${invalid("phone") ? "border-red-400 bg-red-50/10" : "border-[#334155] focus-within:border-[#10B981]"}`}>
									<FontAwesomeIcon icon={faPhone} className="text-[#94A3B8] text-[16px]" />
									<input
										value={form.phone}
										onChange={(e) => update("phone", e.target.value)}
										className={`flex-1 outline-none text-[16px] ${lang === "ar" ? "text-right" : "text-left"} bg-transparent text-[#FFFFFF]`}
										placeholder={t.phonePH}
										type="tel"
									/>
								</div>
								{invalid("phone") && <p className={`text-red-500 text-xs mt-1 ${lang === "ar" ? "text-right" : "text-left"}`}>{t.required}</p>}
							</div>

							<button
								onClick={handleSubmit}
								className="w-full bg-[#10B981] text-white font-semibold text-[16px] py-3 rounded-xl cursor-pointer hover:bg-[#059669] transition-all duration-300 mt-2"
							>
								{t.submit}
							</button>

						</div>
					</div>

				</div>
				</main>
			) || <DigylogTokenError lang={lang}/>}
		</div>
	);
}
