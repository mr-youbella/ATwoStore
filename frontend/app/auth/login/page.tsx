"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useLang } from "@/app/lib/hooks/useLang";
import { messages } from "@/app/lib/langs/messages";
import LoadingPage from "@/app/loading";
import { checkAuth, login } from "@/app/lib/auth/auth";
import Header from "@/app/header";

export default function LoginPage()
{
	const router = useRouter();
	const { lang, toggleLang, lang_loading } = useLang();
	const [form, setForm]         = useState({ identifier: "", password: "" });
	const [showPass, setShowPass] = useState(false);
	const [loading, setLoading]   = useState(false);
	const [auth_loading, setAuthLoading]   = useState(true);
	const [submitted, setSubmitted] = useState(false);
	const t = messages[lang];

	useEffect(() =>
	{
		async function check()
		{
			const ok = await checkAuth(true, false, router);
			if (ok)
				return ;
			setAuthLoading(false);
		}
		check();
	}, []);

	function update(field: string, value: string)
	{
		setForm((prev) => ({ ...prev, [field]: value }));
	}

	async function handleSubmit()
	{
		setSubmitted(true);
		if (!form.identifier.trim() || !form.password.trim())
			return;
		setLoading(true);
		try
		{
			const data = await login(form.identifier, form.password);
			toast.success(t.loginSuccess);
			router.replace("/home");
		}
		catch (err: any)
		{
			toast.error(err.message || t.loginFailed);
		}
		finally
		{
			setLoading(false);
		}
	};

	const invalid = (field: string) => submitted && !form[field as keyof typeof form].trim();

	if(lang_loading || auth_loading)
		return <LoadingPage />;
	return (
		<div className="min-h-screen bg-[#F0F2FF]" dir={lang === "ar" ? "rtl" : "ltr"}>
			<ToastContainer position="top-right" rtl={lang === "ar"} />

			<Header lang={lang} name_page={t.loginSubtitle} toggleLang={toggleLang} />
			<main className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
				{/* Card */}
				<div className="bg-white rounded-2xl shadow-sm p-6 py-10 w-full max-w-md space-y-4">

					{/* Identifier */}
					<div>
						<label className="block text-xs font-semibold text-[#505F76] mb-1">{t.identifier}</label>
						<input
							value={form.identifier}
							onChange={(e) => update("identifier", e.target.value)}
							className={`w-full border rounded-xl px-4 py-2.5 text-[16px] outline-none transition-colors ${invalid("identifier") ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-[#4F46E5]"}`}
							placeholder={t.identifierPlaceholder}
						/>
						{invalid("identifier") && <p className="text-red-500 text-xs mt-1">{t.required}</p>}
					</div>

					{/* Password */}
					<div>
						<label className="block text-xs font-semibold text-[#505F76] mb-1">{t.password}</label>
						<div className="relative">
							<input
								value={form.password}
								onChange={(e) => update("password", e.target.value)}
								type={showPass ? "text" : "password"}
								onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
								className={`w-full border rounded-xl px-4 py-2.5 text-[16px] outline-none transition-colors ${lang === "ar" ? "pl-10" : "pr-10"} ${invalid("password") ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-[#4F46E5]"}`}
								placeholder="••••••••"
							/>
							<button
								type="button"
								onClick={() => setShowPass(!showPass)}
								className={`absolute ${lang === "ar" ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-[#505F76] cursor-pointer`}
							>
								<FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} className="text-xs" />
							</button>
						</div>
						{invalid("password") && <p className="text-red-500 text-xs mt-1">{t.passwordRequired}</p>}
					</div>

					{/* Submit */}
					<button
						onClick={handleSubmit}
						disabled={loading}
						className="w-full bg-[#4F46E5] text-white font-semibold text-sm py-2.5 rounded-xl cursor-pointer hover:bg-[#4338CA] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
					>
						{loading ? t.loginLoading : t.loginBtn}
					</button>

					{/* Register link */}
					<p className="text-center text-xs text-[#505F76]">
						{t.noAccount}{" "}
						<button onClick={() => router.push("/auth/register")} className="text-[#4F46E5] font-semibold cursor-pointer hover:underline">
							{t.goRegister}
						</button>
					</p>

				</div>
			</main>
		</div>
	);
}
