"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLang } from "@/app/lib/hooks/useLang";
import { messages } from "@/app/lib/langs/messages";
import LoadingPage from "@/app/loading";
import { checkAuth } from "@/app/lib/auth/auth";
import { getToken } from "@/app/lib/cookies/get_token";
import Header from "@/app/header";

export default function LoginPage()
{
	const router = useRouter();
	const { lang, toggleLang, lang_loading } = useLang();
	const [auth_loading, setAuthLoading]   = useState(true);
	const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
	const inputs = useRef<(HTMLInputElement | null)[]>([]);
    const [resending, setResending] = useState(false);
	const [countdown, setCountdown] = useState(0);
    const [warning, setWarning] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading]   = useState(false);
	const t = messages[lang];
	const minutes = String(Math.floor(countdown / 60)).padStart(2, "0");
	const seconds = String(countdown % 60).padStart(2, "0");

	useEffect(() =>
	{
		async function check()
		{
			const ok = await checkAuth(false, true, router);
			if (ok)
				return ;
			setAuthLoading(false);
		}
		check();
	}, []);

	useEffect(() =>
	{
		if (countdown === 0)
			return;
		const timer = setInterval(() => { setCountdown((prev) => prev - 1); }, 1000);
		return (() => clearInterval(timer));
	}, [countdown]);

	function handlePaste(e: React.ClipboardEvent)
	{
		e.preventDefault();
		const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
		const new_code = [...code];
		pasted.split("").forEach((char, index) => { new_code[index] = char; });
		setCode(new_code);
		inputs.current[Math.min(pasted.length, 5)]?.focus();
	};
	function handleChange(index: number, value: string)
	{
		if (!/^\d*$/.test(value))
			return ;
		const new_code = [...code];
		new_code[index] = value.slice(-1);
		setCode(new_code);
		setError("");
		if (value && index < 5)
			inputs.current[index + 1]?.focus();
	};
	function handleKeyDown(index: number, e: React.KeyboardEvent)
	{
		if (e.key === "Backspace" && !code[index] && index > 0)
			inputs.current[index - 1]?.focus();
	};

	async function handleResend(e: React.FormEvent | null)
	{
		setResending(true);
		try
		{
			const res = await fetch("/api/auth/sendCode",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});
			const data = await res.json();
			if (!res.ok)
			{
				toast.error(data.error || t.failedSendCode);
				return ;
			}
			toast.success(t.sendCode);
			setCountdown(60);
			setWarning(true);
		}
		catch
		{
			toast.error(t.serverError);
		}
		finally
		{
			setResending(false);
		}
	};

	async function handleSubmit(e: React.FormEvent)
	{
		e.preventDefault();
		if (code.some((d) => d === ""))
		{
			setError("Please enter the complete 6-digit code.");
			return ;
		}
		setLoading(true);
		const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
		const token = await getToken();
		try
		{
			const res = await fetch(`${BACKEND_URL}/verifyEmail`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
				body: JSON.stringify({ code: code.join("") }),
			});
			const data = await res.json();
			if (!res.ok)
			{
				toast.error(data.error || t.invalidCode);
				return ;
			}
			toast.success(t.successCode);
			router.replace("/home");
		}
		catch
		{
			toast.error(t.serverError);
		}
		finally
		{
			setLoading(false);
		}
	};

	if(lang_loading || auth_loading)
		return <LoadingPage />;
	return (
		<div className="min-h-screen bg-[#0F172A]" dir={lang === "ar" ? "rtl" : "ltr"}>
			<Header lang={lang} name_page={t.verifySubtitle} toggleLang={toggleLang} />

			<main className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">

				{/* Card */}
				<form onSubmit={handleSubmit} className="bg-[#1E293B] rounded-2xl shadow-sm p-6 py-10 w-full max-w-md space-y-4">

					<div className="space-y-1.5">
						<h2 className="text-3xl font-bold text-[#10B981]">{t.verifyTitle}</h2>
						<p className="text-[#94A3B8]">{t.verifyDec}</p>
					</div>
					<div hidden={!warning} className="mt-4 rounded-lg border-l-4 border-yellow-500 bg-[#0F172A] p-4">
						<p className="text-sm font-medium text-yellow-500">{t.verifyTitleWarning}</p>
						<p className="mt-1 text-sm text-yellow-400">{t.verifyDecWarning}</p>
					</div>
					<div className="flex justify-center gap-3" onPaste={handlePaste}>
						{code.map((digit, index) =>
						(
							<input key={index} ref={(el) => { inputs.current[index] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handleChange(index, e.target.value)} onKeyDown={(e) => handleKeyDown(index, e)} className={`w-12 h-14 text-center text-xl font-semibold border bg-[#0F172A] text-[#FFFFFF] ${error ? "border-red-500" : digit ? "border-[#10B981]" : "border-[#334155]"} rounded-xl focus:outline-none focus:border-[#10B981] transition-all`}/>
						))}
					</div>
					<button type="submit" disabled={loading} className="w-full bg-[#10B981] hover:bg-[#059669] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-sm tracking-widest uppercase rounded-xl py-3.5 transition-colors flex items-center justify-center gap-2 mt-1 cursor-pointer">{loading ? t.verfySendCodeLoading : t.verfySendCode }</button>
					{error && <p className="text-red-500 text-xs text-center -mt-2">{error}</p>}
					<div className="text-center">
						<p className="text-[#94A3B8]">{t.verfyResendQ}</p>
						<button onClick={handleResend} type="button" disabled={resending || countdown > 0} className="w-fit bg-transparent hover:underline disabled:opacity-50 disabled:cursor-not-allowed text-[#10B981] text-sm font-semibold tracking-wider transition-colors cursor-pointer">{resending ? t.verfyReSendCodeLoading : t.verfyReSendCode}</button>
						<span className="ml-2 text-sm font-bold text-[#10B981]">{minutes}:{seconds}</span>
					</div>
				</form>
			</main>
			<ToastContainer position="top-right" rtl={lang === "ar"} />
		</div>
	);
}
