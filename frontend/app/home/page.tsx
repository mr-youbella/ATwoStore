"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruck, faList, faTableCells, faPlus, faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { useLang } from "../lib/hooks/useLang";
import { messages } from "../lib/langs/messages";
import LoadingPage from "../loading";
import { checkAuth } from "../lib/auth/auth";
import Header from "../header";
import { getToken } from "../lib/cookies/get_token";
import { faBlackTie } from "@fortawesome/free-brands-svg-icons";

export default function HomePage()
{
	const router                                = useRouter();
	const { lang, toggleLang, lang_loading }    = useLang();
	const t									    = messages[lang];
	const [username, setUsername]			    = useState<string | null>(null);
	const [is_admin, setIsAdmin]			    = useState<boolean>(false);
	const [auth_loading, setAuthLoading]        = useState(true);

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
		async function getUser()
		{
			try
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
				const data = await res.json();
				setUsername(data.username);
				setIsAdmin(data.is_admin);
			}
			catch (err)
			{
				return (null);
			}
		}
		getUser();
	}, []);

	if(lang_loading || auth_loading)
		return <LoadingPage />;
	return (
		<div className="min-h-screen bg-[#F0F2FF]" dir={lang === "ar" ? "rtl" : "ltr"}>

			{/* Navbar */}
			<Header lang={lang} name_page={t.subtitle} toggleLang={toggleLang}/>

			<main className="xl:w-1/2 xl:mx-auto p-5 space-y-5">

				{/* Welcome */}
				<div className={`${lang === "ar" ? "text-right" : "text-left"} pt-2`}>
					<p className="text-[#505F76] text-sm">{t.welcome}</p>
					<h2 className="text-3xl font-black text-[#1A1A2E] mt-1">
						{username || '-'} 👋
					</h2>
					<div className={`w-10 h-1 bg-[#4F46E5] rounded-full mt-2`} />
				</div>

				{/* Quick Access */}
				<div>
					<h3 className={`text-lg font-bold text-[#1A1A2E] mb-3 ${lang === "ar" ? "text-right" : "text-left"}`}>{t.quickAccess}</h3>
					<div className="grid grid-cols-2 gap-3">

						{/* Orders */}
						<button
							onClick={() => router.push("/orders")}
							className="bg-white rounded-2xl p-5 shadow-sm flex flex-col items-center gap-3 cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
						>
							<div className="w-14 h-14 rounded-xl bg-[#E2DFFF] flex items-center justify-center">
								<FontAwesomeIcon icon={faList} className="text-[#4F46E5] text-xl" />
							</div>
							<div className="text-center">
								<p className="font-bold text-sm text-[#1A1A2E]">{t.ordersList}</p>
								<p className="text-[#505F76] text-xs mt-0.5">{t.ordersDesc}</p>
							</div>
						</button>

						{/* Dashboard */}
						<button
							onClick={() => router.push("/dashboard")}
							className="bg-white rounded-2xl p-5 shadow-sm flex flex-col items-center gap-3 cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
						>
							<div className="w-14 h-14 rounded-xl bg-[#E2DFFF] flex items-center justify-center">
								<FontAwesomeIcon icon={faTableCells} className="text-[#4F46E5] text-xl" />
							</div>
							<div className="text-center">
								<p className="font-bold text-sm text-[#1A1A2E]">{t.dashboard}</p>
								<p className="text-[#505F76] text-xs mt-0.5">{t.dashboardDesc}</p>
							</div>
						</button>

						{/* Admin */}
						{is_admin &&
							<>
								<button
									onClick={() => router.push("/admin")}
									className="bg-white rounded-2xl p-5 shadow-sm flex flex-col items-center gap-3 cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
								>
									<div className="w-14 h-14 rounded-xl bg-[#E2DFFF] flex items-center justify-center">
										<FontAwesomeIcon icon={faBlackTie} className="text-[#4F46E5] text-xl" />
									</div>
									<div className="text-center">
										<p className="font-bold text-sm text-[#1A1A2E]">{t.admin}</p>
										<p className="text-[#505F76] text-xs mt-0.5">{t.adminDesc}</p>
									</div>
								</button>
							</>
						}

					</div>
				</div>

				{/* Add Order */}
				<button
					onClick={() => router.push("/createOrder")}
					className="w-full bg-linear-to-r from-[#2071b3] via-[#4d388f] to-[#6c2a74] rounded-2xl p-5 flex items-center justify-between shadow-sm cursor-pointer hover:opacity-95 transition-all duration-300">
					<div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
						<FontAwesomeIcon icon={faChevronLeft} className="text-white text-lg" />
					</div>
					<div className={lang === "ar" ? "text-right" : "text-left"}>
						<p className="text-white font-black text-lg">{t.addOrder}</p>
						<p className="text-white/70 text-sm">{t.addOrderDesc}</p>
					</div>
					<div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
						<FontAwesomeIcon icon={faPlus} className="text-white text-lg" />
					</div>
				</button>

				{/* Pickup */}
				<button
					onClick={() => router.push("/pickup")}
					className="w-full bg-white rounded-2xl p-5 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
				>
					<div className="w-12 h-12 rounded-xl bg-[#E2DFFF] flex items-center justify-center shrink-0">
						<FontAwesomeIcon icon={faTruck} className="text-[#4F46E5] text-lg" />
					</div>
					<div className={lang === "ar" ? "text-right" : "text-left"}>
						<p className="text-[#1A1A2E] font-black text-base">{t.pickup}</p>
						<p className="text-[#505F76] text-sm">{t.pickupDesc}</p>
					</div>
					<div className="w-12 h-12 rounded-xl bg-[#F0F2FF] flex items-center justify-center shrink-0">
						<FontAwesomeIcon icon={faTruck} className="text-[#B0B8C8] text-lg" />
					</div>
				</button>

				<button
    onClick={() => router.push("/assistant")}
    className="w-full bg-linear-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-2xl p-5 flex items-center justify-between shadow-sm cursor-pointer hover:opacity-95 transition-all duration-300"
>
    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
        <span className="text-2xl">🤖</span>
    </div>
    <div className={lang === "ar" ? "text-right" : "text-left"}>
        <p className="text-white font-black text-lg">{t.aiAssistant}</p>
        <p className="text-white/70 text-sm">{t.aiAssistantDesc}</p>
    </div>
    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
        <span className="text-xl">✨</span>
    </div>
</button>

			</main>
		</div>
	);
}
