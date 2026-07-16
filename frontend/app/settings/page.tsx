"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faCircleCheck, faUser, faLink, faCopy, faTrash, faEyeSlash, faEye, faLock } from "@fortawesome/free-solid-svg-icons";
import { useLang } from "../lib/hooks/useLang";
import { messages } from "../lib/langs/messages";
import { checkAuth } from "../lib/auth/auth";
import LoadingPage from "../loading";
import Header from "../header";
import { getToken } from "../lib/cookies/get_token";

export default function SettingsPage()
{
	const	router							   = useRouter();
	const	{ lang, toggleLang, lang_loading } = useLang();
	const	t								  = messages[lang];
	const	[new_digylog_token, setNewDigylogToken]	 = useState("");
	const	[digylog_token, setDigylogToken]	 = useState("");
	const	[loading, setLoading]			  = useState(false);
	const	[saved, setSaved]				  = useState(false);
	const	[auth_loading, setAuthLoading]	 = useState(true);
	const	[new_username, setNewUsername]	 = useState("");
	const	[username, setUsername]	 = useState("");
	const	[old_password, setOldPassword]	 = useState<string | null>(null);
	const	[show_input_old_password, setShowInputOldPassword]	 = useState<boolean | null>(null);
	const	[password, setPassword]	 = useState("");
	const	[token_error, setTokenError]	   = useState("");
	const	[show_token, setShowToken] = useState(false);
	const	[show_old_password, setShowOldPassword] = useState(false);
	const	[show_password, setShowPassword] = useState(false);
	const	[username_error, setUsernameError] = useState("");
	const	[password_error, setPasswordError] = useState("");
	const	[webhook_link, setWebhookLink] = useState("...");
	const	[show_delete_confirm, setShowDeleteConfirm] = useState(false);
	const	[delete_loading, setDeleteLoading]		   = useState(false);
	const	[delete_input, setDeleteInput]			   = useState("");

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
			if (!token)
				return ;
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
				{
					setNewDigylogToken(user.digylog_token);
					setDigylogToken(user.digylog_token);
				}
				if (user.username)
				{
					setNewUsername(user.username);
					setUsername(user.username);
				}
				if (user.webhook_code)
					setWebhookLink(`${process.env.NEXT_PUBLIC_BACKEND_URL}/trackings/webhook/${user.webhook_code}`);
				if (!user.hash_password)
					setShowInputOldPassword(false);
				else
					setShowInputOldPassword(true);
			}
			catch {}
		}
		fetchToken();
	}, []);

	async function saveToken()
	{
		if (!new_digylog_token.trim() || new_digylog_token.trim() === digylog_token.trim())
			return ;
		setLoading(true);
		try
		{
			const check_res = await fetch("/api/checkDigylogToken",
			{
				method:  "POST",
				headers: { "Content-Type": "application/json" },
				body:	JSON.stringify({ digylog_token: new_digylog_token }),
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
				body:	JSON.stringify({ digylog_token: new_digylog_token }),
			});
			if (!res.ok)
			{
				setTokenError(t.serverError);
				return ;
			}
			setSaved(true);
			toast.success(t.settingSaved);
			setTokenError("");
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
		if (!new_username.trim() || new_username.trim() === username.trim())
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
			setUsernameError("");
			setUsername(new_username);
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
	async function newPassword()
	{
		if (!password.trim())
			return ;
		if (password.length < 6)
		{
			setPasswordError(t.passwordTooShort);
			return ;
		}
		setLoading(true);
		try
		{
			const jwt = await getToken();
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/password`,
			{
				method:  "PUT",
				headers: { "Content-Type": "application/json", "Authorization": `Bearer ${jwt}` },
				body:	JSON.stringify({ old_password: old_password, password: password }),
			});
			if (!res.ok)
			{
				const data = await res.json();
				setPasswordError(data.error || t.serverError);
				return ;
			}
			setSaved(true);
			toast.success(t.passwordChanged);
			setPasswordError("");
			setTimeout(() => setSaved(false), 3000);
		}
		catch
		{
			setPasswordError(t.serverError);
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
		await newPassword();
	}

	async function deleteAccount()
	{
		setDeleteLoading(true);
		try
		{
			const jwt = await getToken();
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/delete`,
			{
				method:  "DELETE",
				headers: { "Authorization": `Bearer ${jwt}` },
			});
			if (!res.ok)
			{
				toast.error(t.serverError);
				return ;
			}
			await fetch("/api/auth/removeToken", { method: "POST",});
			router.replace("/auth/login");
		}
		catch
		{
			toast.error(t.serverError);
		}
		finally
		{
			setDeleteLoading(false);
		}
	}

	if (lang_loading || auth_loading || show_old_password === null)
		return <LoadingPage />;

	return (
		<div className="min-h-screen bg-[#0F172A]" dir={lang === "ar" ? "rtl" : "ltr"}>
			<ToastContainer closeOnClick position="top-right" rtl={lang === "ar"} />

			{/* Navbar */}
			<Header lang={lang} name_page={t.settings} toggleLang={toggleLang}/>

			<main className="xl:w-1/2 xl:mx-auto p-5 space-y-3">

				{/* Section title */}
				<p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest px-1">
					{t.integrations}
				</p>

				<div className="bg-[#1E293B] rounded-2xl shadow-sm overflow-hidden">
						<div className="flex items-center gap-3 p-5 border-b border-[#334155]">
							<div className="w-10 h-10 rounded-xl bg-[#0F2E2A] flex items-center justify-center shrink-0">
								<FontAwesomeIcon icon={faLink} className="text-[#10B981] text-sm" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-bold text-[#FFFFFF]">{t.webhookTitle}</p>
								<p className="text-xs text-[#94A3B8] mt-0.5">{t.webhookDesc}</p>
							</div>
						</div>
						<div className="p-5 space-y-3">
							<div className="flex items-center gap-2 bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5">
								<p className="flex-1 text-xs font-mono text-[#94A3B8] break-all">
									{webhook_link}
								</p>
								<button
									onClick={() =>
									{
										navigator.clipboard.writeText(webhook_link);
										toast.success(t.copied);
									}}
									className="shrink-0 text-[#10B981] hover:text-[#059669] cursor-pointer transition-colors"
								>
									<FontAwesomeIcon icon={faCopy} className="text-sm" />
								</button>
							</div>
							<p className="text-xs text-[#94A3B8]">{t.webhookHint}</p>
					</div>
					{/* DigyLog Token Card */}
					<div className="flex items-center gap-3 p-5 border-b border-[#334155]">
						<div className="w-10 h-10 rounded-xl bg-[#0F2E2A] flex items-center justify-center shrink-0">
							<FontAwesomeIcon icon={faKey} className="text-[#10B981] text-sm" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-bold text-[#FFFFFF]">DigyLog API Token</p>
							<p className="text-xs text-[#94A3B8] mt-0.5">{t.tokenDesc}</p>
						</div>
						{new_digylog_token && (
							<span className="text-xs bg-[#0F2E2A] text-[#10B981] px-2 py-1 rounded-full font-semibold shrink-0">
								{t.connected}
							</span>
						)}
					</div>

					<div className="p-5 space-y-3">
						<div className="relative">
							<div className="relative">
								<input
									type={show_token ? "text" : "password"}
									value={new_digylog_token}
									onChange={(e) => { setNewDigylogToken(e.target.value); setSaved(false); }}
									className="w-full border border-[#334155] bg-[#0F172A] text-[#FFFFFF] rounded-xl px-4 py-2.5 text-[16px] outline-none focus:border-[#10B981] transition-colors font-mono pr-10"
									placeholder="f18f2f7d853fe3..."
								/>
								<button
									type="button"
									onClick={() => setShowToken(!show_token)}
									className="absolute inset-y-0 right-3 flex items-center text-[#94A3B8] hover:text-[#FFFFFF]"
								>
									<FontAwesomeIcon icon={show_token ? faEyeSlash : faEye} />
								</button>
							</div>
							{token_error && <p className="text-red-500 text-xs mt-1">{token_error}</p>}
						</div>
					</div>

					{/* Username Card */}
					<div className="flex items-center gap-3 p-5 border-b border-[#334155]">
						<div className="w-10 h-10 rounded-xl bg-[#0F2E2A] flex items-center justify-center shrink-0">
							<FontAwesomeIcon icon={faUser} className="text-[#10B981] text-sm" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-bold text-[#FFFFFF]">{t.username}</p>
							<p className="text-xs text-[#94A3B8] mt-0.5">{t.usernameDesc}</p>
						</div>
					</div>
										
					<div className="p-5 space-y-3">
						<input
							value={new_username}
							onChange={(e) => { setNewUsername(e.target.value); setSaved(false); }}
							className="w-full border border-[#334155] bg-[#0F172A] text-[#FFFFFF] rounded-xl px-4 py-2.5 text-[16px] outline-none focus:border-[#10B981] transition-colors"
							placeholder={t.usernamePlaceholder}
						/>
						{username_error && <p className="text-red-500 text-xs mt-1">{username_error}</p>}
					</div>

					{/* Password Card */}
					<div className="flex items-center gap-3 p-5 border-b border-[#334155]">
						<div className="w-10 h-10 rounded-xl bg-[#0F2E2A] flex items-center justify-center shrink-0">
							<FontAwesomeIcon icon={faLock} className="text-[#10B981] text-sm" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-bold text-[#FFFFFF]">{t.changePassword}</p>
							<p className="text-xs text-[#94A3B8] mt-0.5">{t.changePasswordDesc}</p>
						</div>
					</div>
										
					<div className="p-5 space-y-3">
						<div className="relative">
							<input
								hidden={show_input_old_password ? !show_input_old_password : false}
								type={show_old_password ? "text" : "password"}
								value={old_password ?? ""}
								onChange={(e) => { setOldPassword(e.target.value); setSaved(false); }}
								className="w-full border border-[#334155] bg-[#0F172A] text-[#FFFFFF] rounded-xl px-4 py-2.5 text-[16px] outline-none focus:border-[#10B981] transition-colors pr-10"
								placeholder={t.currentPassword}
							/>
							<button
								type="button"
								onClick={() => setShowOldPassword(!show_old_password)}
								className="absolute inset-y-0 right-3 flex items-center text-[#94A3B8] hover:text-[#FFFFFF]"
							>
								<FontAwesomeIcon icon={show_old_password ? faEyeSlash : faEye} />
							</button>
						</div>
						<div className="relative">
							<input
								type={show_password ? "text" : "password"}
								value={password}
								onChange={(e) => { setPassword(e.target.value); setSaved(false); }}
								className="w-full border border-[#334155] bg-[#0F172A] text-[#FFFFFF] rounded-xl px-4 py-2.5 text-[16px] outline-none focus:border-[#10B981] transition-colors pr-10"
								placeholder={t.newPassword}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!show_password)}
								className="absolute inset-y-0 right-3 flex items-center text-[#94A3B8] hover:text-[#FFFFFF]"
							>
								<FontAwesomeIcon icon={show_password ? faEyeSlash : faEye} />
							</button>
						</div>
						{password_error && <p className="text-red-500 text-xs mt-1">{password_error}</p>}
					</div>
				</div>
				

				<button
					onClick={saveAll}
					disabled={loading || saved}
					className={`w-full font-semibold text-sm py-2.5 rounded-xl cursor-pointer transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2
						${saved
							? "bg-[#0F2E2A] text-[#10B981]"
							: "bg-[#10B981] text-white hover:bg-[#059669] disabled:opacity-60"
						}`}
				>
							{ saved ? <><FontAwesomeIcon icon={faCircleCheck} /> {t.settingSaved}</> : loading ? t.saving : t.save }
				</button>

				{/* Delete Account */}
			<button
				onClick={() => setShowDeleteConfirm(true)}
				className="w-full text-sm font-semibold text-red-500 py-2.5 rounded-xl cursor-pointer hover:bg-red-500/10 transition-colors border border-red-500/30"
			>
				{t.deleteAccount}
			</button>

			{/* Confirm Modal */}
			{show_delete_confirm && (
				<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
					<div className="bg-[#1E293B] rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4" dir={lang === "ar" ? "rtl" : "ltr"}>
						<div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
							<FontAwesomeIcon icon={faTrash} className="text-red-500 text-lg" />
						</div>
						<div className="text-center">
							<h2 className="text-lg font-bold text-[#FFFFFF]">{t.deleteAccountTitle}</h2>
							<p className="text-xs text-[#94A3B8] mt-1">{t.deleteAccountDesc}</p>
						</div>
						<div>
							<p className="text-xs text-[#94A3B8] mb-2">{t.deleteAccountConfirm} <span className="font-bold text-[#FFFFFF]">{new_username}</span></p>
							<input
								value={delete_input}
								onChange={(e) => setDeleteInput(e.target.value)}
								className="w-full border border-[#334155] bg-[#0F172A] text-[#FFFFFF] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 transition-colors"
								placeholder={new_username}
							/>
						</div>
						<div className="flex gap-2">
							<button
								onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}
								className="flex-1 border border-[#334155] rounded-xl py-2.5 text-sm font-semibold text-[#94A3B8] cursor-pointer hover:bg-[#334155] hover:text-white"
							>
								{t.cancel}
							</button>
							<button
								onClick={deleteAccount}
								disabled={delete_input !== new_username || delete_loading}
								className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold cursor-pointer hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
							>
								{delete_loading ? t.deleting : t.deleteConfirmBtn}
							</button>
						</div>
					</div>
				</div>
			)}
			</main>
		</div>
	);
}
