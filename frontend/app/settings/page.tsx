"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faCircleCheck, faUser } from "@fortawesome/free-solid-svg-icons";
import { useLang } from "../lib/hooks/useLang";
import { messages } from "../lib/langs/messages";
import { checkAuth } from "../lib/auth/auth";
import LoadingPage from "../loading";
import Header from "../header";
import { getToken } from "../lib/cookies/get_token";

export default function SettingsPage()
{
	const	router	                           = useRouter();
	const	{ lang, toggleLang, lang_loading } = useLang();
	const	t                                  = messages[lang];
	const	[digylog_token, setDigylogToken]	 = useState("");
	const	[loading, setLoading]              = useState(false);
	const	[saved, setSaved]                  = useState(false);
	const	[auth_loading, setAuthLoading]     = useState(true);
	const	[new_username, setNewUsername]     = useState("");
	const	[token_error, setTokenError]       = useState("");
	const	[username_error, setUsernameError] = useState("");

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
	    async function fetchToken()
	    {
	        const token = await getToken();
	    	if (!token) return ;
			try
			{
				const res  = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`,
				{
					headers: { "Authorization": `Bearer ${token}` }
				});
				if (!res.ok)
					return ;
				const user = await res.json();
				if (user.digylog_token)
					setDigylogToken(user.digylog_token.slice(0, -10) + "**********");
				if (user.username)
					setNewUsername(user.username);
			}
			catch {}
		}
		fetchToken();
	}, []);

	async function saveToken()
	{
		if (!digylog_token.trim())
			return ;
		setLoading(true);
		try
		{
			const check_res = await fetch("/api/checkDigylogToken",
			{
				method:  "POST",
				headers: { "Content-Type": "application/json" },
				body:    JSON.stringify({ digylog_token: digylog_token }),
			});
			const check = await check_res.json();
			if (!check.valid)
			{
				setTokenError(t.tokenInvalid);
				setLoading(false);
				return ;
			}
			const token = await getToken();
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/saveToken`,
			{
				method:  "PUT",
				headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
				body:    JSON.stringify({ digylog_token: digylog_token }),
			});
			if (!res.ok)
			{
				setTokenError(t.serverError);
				return ;
			}
			setSaved(true);
			toast.success(t.settingSaved);
			setSaved(false);
		}
		catch
		{
			setTokenError(t.serverError);
		}
		finally
		{
			setSaved(false);
			setLoading(false);
		}
	}
	async function saveUsername()
	{
		if (!new_username.trim())
			return ;
		if (new_username.length < 3)
		{
			setUsernameError(t.usernameTooShort);
			return ;
		}
		if (!/^[a-z_]+$/.test(new_username))
		{
			setUsernameError(t.usernameInvalid);
			return ;
		}
		setLoading(true);
		try
		{
			const jwt = await getToken();
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/username`,
			{
				method:  "PUT",
				headers: { "Content-Type": "application/json", "Authorization": `Bearer ${jwt}` },
				body:	JSON.stringify({ username: new_username }),
			});
			if (!res.ok)
			{
				const data = await res.json();
				setUsernameError(data.error || t.serverError);
				return ;
			}
			setSaved(true);
			toast.success(t.usernameSaved);
			setTimeout(() => setSaved(false), 3000);
		}
		catch
		{
			setUsernameError(t.serverError);
		}
		finally
		{
			setLoading(false);
		}
	}

	async function saveAll()
	{
		await saveToken();
		await saveUsername();
	}

	if (lang_loading || auth_loading)
		return <LoadingPage />;

	return (
		<div className="min-h-screen bg-[#F0F2FF]" dir={lang === "ar" ? "rtl" : "ltr"}>
			<ToastContainer position="top-right" rtl={lang === "ar"} />

			{/* Navbar */}
			<Header lang={lang} name_page={t.settings} toggleLang={toggleLang}/>

			<main className="xl:w-1/2 xl:mx-auto p-5 space-y-3">

				{/* Section title */}
				<p className="text-xs font-bold text-[#505F76] uppercase tracking-widest px-1">
					{t.integrations}
				</p>

				<div className="bg-white rounded-2xl shadow-sm overflow-hidden">

					{/* DigyLog Token Card */}
					<div className="flex items-center gap-3 p-5 border-b border-gray-100">
						<div className="w-10 h-10 rounded-xl bg-[#E2DFFF] flex items-center justify-center shrink-0">
							<FontAwesomeIcon icon={faKey} className="text-[#4F46E5] text-sm" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-bold text-[#1A1A2E]">DigyLog API Token</p>
							<p className="text-xs text-[#505F76] mt-0.5">{t.tokenDesc}</p>
						</div>
						{digylog_token && (
							<span className="text-xs bg-[#E1F5EE] text-[#0F6E56] px-2 py-1 rounded-full font-semibold shrink-0">
								{t.connected}
							</span>
						)}
					</div>

					<div className="p-5 space-y-3">
						<div className="relative">
							<input
								value={digylog_token}
								onChange={(e) => { setDigylogToken(e.target.value); setSaved(false); }}
								className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#4F46E5] transition-colors font-mono pr-10"
								placeholder="f18f2f7d853fe3..."
							/>
							{token_error && <p className="text-red-500 text-xs mt-1">{token_error}</p>}
						</div>
					</div>

					{/* Username Card */}
					<div className="flex items-center gap-3 p-5 border-b border-gray-100">
						<div className="w-10 h-10 rounded-xl bg-[#E2DFFF] flex items-center justify-center shrink-0">
							<FontAwesomeIcon icon={faUser} className="text-[#4F46E5] text-sm" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-bold text-[#1A1A2E]">{t.username}</p>
							<p className="text-xs text-[#505F76] mt-0.5">{t.usernameDesc}</p>
						</div>
					</div>
										
					<div className="p-5 space-y-3">
						<input
							value={new_username}
							onChange={(e) => { setNewUsername(e.target.value); setSaved(false); }}
							className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#4F46E5] transition-colors"
							placeholder={t.usernamePlaceholder}
						/>
						{username_error && <p className="text-red-500 text-xs mt-1">{username_error}</p>}
					</div>
				</div>
				

				<button
					onClick={saveAll}
					disabled={loading || saved}
					className={`w-full font-semibold text-sm py-2.5 rounded-xl cursor-pointer transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2
						${saved
							? "bg-[#E1F5EE] text-[#0F6E56]"
							: "bg-[#4F46E5] text-white hover:bg-[#4338CA] disabled:opacity-60"
						}`}
				>
							{ saved ? <><FontAwesomeIcon icon={faCircleCheck} /> {t.settingSaved}</> : loading ? t.saving : t.save }
				</button>

				{/* Placeholder for future settings */}
				<p className="text-sm text-[#747f95] text-center py-2">{t.moreSettingsSoon}</p>

			</main>
		</div>
	);
}
