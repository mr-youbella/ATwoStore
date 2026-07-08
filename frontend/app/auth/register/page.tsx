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
import { checkAuth, register } from "@/app/lib/auth/auth";
import Header from "@/app/header";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { signIn } from "next-auth/react";

export default function RegisterPage()
{
	const router = useRouter();
	const { lang, toggleLang, lang_loading } = useLang();
	const [form, setForm]         = useState({ username: "", email: "", password: "", digylog_token: "" });
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
		if (!form.username.trim() || !form.email.trim() || !form.password.trim())
			return ;
		if (form.username.length < 3)
		{
			toast.error(t.usernameTooShort);
			return;
		}
		
		if (!/^[a-z_]+$/.test(form.username)) 
		{
			toast.error(t.usernameInvalid);
			return;
		}
		if (form.password.length < 6)
		{
			toast.error(t.passwordTooShort);
			return;
		}
		setLoading(true);
		try
		{
			const data = await register(form);
			setTimeout(() => { toast.success(t.registerSuccess); }, 1000);
			router.replace("/auth/login");
		}
		catch (err: any)
		{
			toast.error(err.message || t.registerFailed);
		}
		finally
		{
			setLoading(false);
		}
	}
	async function loginByGoogle()
	{
		setLoading(true);
		try
		{
			const res = await signIn("google", { redirect: false });
			if (res?.error) 
			{
				toast.error(res.error);
				return ;
			}
			else if (res?.ok)
				toast.success(t.loginSuccess);
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
			<Header lang={lang} name_page={t.registerSubtitle} toggleLang={toggleLang} />
			<main className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">

				{/* Card */}
				<div className="bg-white rounded-2xl shadow-sm p-6 py-10 w-full max-w-md space-y-4">

					{/* Username */}
					<div>
						<label className="block text-xs font-semibold text-[#505F76] mb-1">
							{t.username} <span className="text-red-400">*</span>
						</label>
						<input
							value={form.username}
							onChange={(e) => update("username", e.target.value)}
							className={`w-full border rounded-xl px-4 py-2.5 text-[16px ] outline-none transition-colors ${invalid("username") ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-[#4F46E5]"}`}
							placeholder={t.usernamePlaceholder}
						/>
						{invalid("username") && <p className="text-red-500 text-xs mt-1">{t.usernameRequired}</p>}
					</div>

					{/* Email */}
					<div>
						<label className="block text-xs font-semibold text-[#505F76] mb-1">
							{t.email} <span className="text-red-400">*</span>
						</label>
						<input
							value={form.email}
							onChange={(e) => update("email", e.target.value)}
							type="email"
							className={`w-full border rounded-xl px-4 py-2.5 text-[16px ] outline-none transition-colors ${invalid("email") ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-[#4F46E5]"}`}
							placeholder={t.emailPlaceholder}
						/>
						{invalid("email") && <p className="text-red-500 text-xs mt-1">{t.emailRequired}</p>}
					</div>

					{/* Password */}
					<div>
						<label className="block text-xs font-semibold text-[#505F76] mb-1">
							{t.password} <span className="text-red-400">*</span>
						</label>
						<div className="relative">
							<input
								value={form.password}
								onChange={(e) => update("password", e.target.value)}
								type={showPass ? "text" : "password"}
								onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
								className={`w-full border rounded-xl px-4 py-2.5 text-[16px ] outline-none transition-colors ${lang === "ar" ? "pl-10" : "pr-10"} ${invalid("password") ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-[#4F46E5]"}`}
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

					{/* DigyLog Token */}
					<div>
						<label className="block text-xs font-semibold text-[#505F76] mb-1">
							{t.digylogToken}{" "}
							<span className="text-[#505F76] font-normal">{t.optional}</span>
						</label>
						<input
							value={form.digylog_token}
							onChange={(e) => update("digylog_token", e.target.value)}
							className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[16px ] outline-none focus:border-[#4F46E5] transition-colors font-mono"
							placeholder={t.tokenPlaceholder}
						/>
						<p className="text-[#505F76] text-xs mt-1">{t.tokenHint}</p>
					</div>

					{/* Submit */}
					<button
						onClick={handleSubmit}
						disabled={loading}
						className="w-full bg-[#4F46E5] text-white font-semibold text-sm py-2.5 rounded-xl cursor-pointer hover:bg-[#4338CA] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
					>
						{loading ? t.registerLoading : t.registerBtn}
					</button>

					{/* Register By Google */}

					<div className="flex">
						<div className="h-px bg-gray-500 flex-1 my-auto"></div>
						<p className="text-gray-500 mx-1">OR</p>
						<div className="h-px bg-gray-500 flex-1 my-auto"></div>
					</div>

					<button
						onClick={loginByGoogle}
						disabled={loading}
						className="w-full bg-white text-black border border-gray-300 font-semibold text-sm py-2.5 rounded-xl cursor-pointer hover:bg-[#e8e8f2] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
					>
						<FontAwesomeIcon icon={faGoogle}/> Sign in with Google
					</button>

					{/* Login link */}
					<p className="text-center text-xs text-[#505F76]">
						{t.hasAccount}{" "}
						<button onClick={() => router.push("/auth/login")} className="text-[#4F46E5] font-semibold cursor-pointer hover:underline">
							{t.goLogin}
						</button>
					</p>

				</div>
			</main>
			<ToastContainer position="top-right" rtl={lang === "ar"} />
		</div>
	);
}
