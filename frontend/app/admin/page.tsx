"use client";
import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faChartBar, faBoxOpen, faTrash, faEye, faSearch, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { getToken } from "../lib/cookies/get_token";
import LoadingPage from "../loading";
import Header from "../header";
import { useLang } from "../lib/hooks/useLang";
import { messages } from "../lib/langs/messages";

interface User
{
	id:             number;
	username:       string;
	email:          string;
	digylog_token:  string | null;
	is_admin:       boolean;
	email_verified: boolean;
	created_at:     string;
	tracking_count: number;
	last_seen:		string | null;
}

export default function AdminPage()
{
	const router                             = useRouter();
	const { lang, toggleLang, lang_loading } = useLang();
	const t                                  = messages[lang];
	const [auth_loading, setAuthLoading]     = useState(true);
	const [users, setUsers]                  = useState<User[]>([]);
	const [search, setSearch]                = useState("");
	const [expanded, setExpanded]            = useState<number | null>(null);
	const [loading, setLoading]              = useState(true);
	const [delete_id, setDeleteId]           = useState<number | null>(null);

	useEffect(() =>
	{
		async function check()
		{
			const token = await getToken();
			if (!token)
			{
				router.replace("/auth/login");
				return ;
			}
			try
			{
				const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`,
				{
					headers: { "Authorization": `Bearer ${token}` }
				});
				if (!res.ok)
				{
					router.replace("/auth/login");
					return ;
				}
				const user = await res.json();
				if (!user.is_admin)
				{
					router.replace("/home");
					return ;
				}
			}
			catch
			{
				router.replace("/auth/login");
			}
			setAuthLoading(false);
			fetchUsers(token);
		}
		check();
	}, []);

	async function fetchUsers(token: string)
	{
		setLoading(true);
		try
		{
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/users`,
			{
				headers: { "Authorization": `Bearer ${token}` }
			});
			if (!res.ok)
				return ;
			const data: User[] = await res.json();
			setUsers(data);
		}
		catch {}
		finally { setLoading(false); }
	}

	async function deleteUser(id: number)
	{
		const token = await getToken();
		try
		{
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/users/${id}`,
			{
				method:  "DELETE",
				headers: { "Authorization": `Bearer ${token}` }
			});
			if (!res.ok)
			{
				toast.error(t.serverError);
				return ;
			}
			setUsers((prev) => prev.filter((u) => u.id !== id));
			setDeleteId(null);
			toast.success(t.deleted);
		}
		catch { toast.error(t.serverError); }
	}

	const filtered = users.filter((u) =>
		u.username.toLowerCase().includes(search.toLowerCase()) ||
		u.email.toLowerCase().includes(search.toLowerCase())
	);

	const stats =
	{
		total:      users.length,
		verified:   users.filter((u) => u.email_verified).length,
		with_token: users.filter((u) => u.digylog_token).length,
		admins:     users.filter((u) => u.is_admin).length,
	};

	if (lang_loading || auth_loading)
		return <LoadingPage />;

	return (
		<div className="min-h-screen bg-[#0F172A]" dir={lang === "ar" ? "rtl" : "ltr"}>
			<ToastContainer closeOnClick position="top-right" rtl={lang === "ar"} />
			<Header lang={lang} name_page={t.adminTitle} toggleLang={toggleLang} />

			<main className="xl:w-3/4 xl:mx-auto p-5 space-y-4">

				{/* Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
					<div className="bg-[#1E293B] rounded-2xl p-4 shadow-sm text-center">
						<p className="text-xs text-[#94A3B8] font-medium mb-1">{t.adminTotalUsers}</p>
						<p className="text-2xl font-bold text-[#10B981]">{stats.total}</p>
					</div>
					<div className="bg-[#1E293B] rounded-2xl p-4 shadow-sm text-center">
						<p className="text-xs text-[#94A3B8] font-medium mb-1">{t.adminVerified}</p>
						<p className="text-2xl font-bold text-[#10B981]">{stats.verified}</p>
					</div>
					<div className="bg-[#1E293B] rounded-2xl p-4 shadow-sm text-center">
						<p className="text-xs text-[#94A3B8] font-medium mb-1">{t.adminWithToken}</p>
						<p className="text-2xl font-bold text-[#10B981]">{stats.with_token}</p>
					</div>
					<div className="bg-[#1E293B] rounded-2xl p-4 shadow-sm text-center">
						<p className="text-xs text-[#94A3B8] font-medium mb-1">{t.adminAdmins}</p>
						<p className="text-2xl font-bold text-[#854F0B]">{stats.admins}</p>
					</div>
				</div>

				{/* Users Table */}
				<div className="bg-[#1E293B] rounded-2xl shadow-sm overflow-hidden">

					{/* Toolbar */}
					<div className="p-4 border-b border-[#334155]">
						<div className="relative max-w-xs">
							<FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-xs" />
							<input
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="w-full border border-[#334155] bg-[#0F172A] text-[#FFFFFF] rounded-xl py-2 pr-9 pl-3 text-sm outline-none focus:border-[#10B981]"
								placeholder={t.adminSearch}
							/>
						</div>
					</div>

					{/* Loading */}
					{loading && (
						<div className="w-full">
							<div className="h-1.5 bg-[#0F172A] rounded-full overflow-hidden">
								<div className="h-full bg-[#10B981] rounded-full animate-progress" />
							</div>
						</div>
					)}

					{/* Table */}
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-[#334155] bg-[#0F172A]">
									<th className="text-center text-xs font-semibold text-[#94A3B8] p-3 w-10"></th>
									<th className="text-center text-xs font-semibold text-[#94A3B8] p-3">#</th>
									<th className="text-center text-xs font-semibold text-[#94A3B8] p-3">{t.adminUsername}</th>
									<th className="text-center text-xs font-semibold text-[#94A3B8] p-3">{t.adminEmail}</th>
									<th className="text-center text-xs font-semibold text-[#94A3B8] p-3">{t.adminLastSeen}</th>
									<th className="text-center text-xs font-semibold text-[#94A3B8] p-3">{t.adminOrders}</th>
									<th className="text-center text-xs font-semibold text-[#94A3B8] p-3">{t.adminCreatedAt}</th>
									<th className="text-center text-xs font-semibold text-[#94A3B8] p-3">{t.adminStatus}</th>
									<th className="text-center text-xs font-semibold text-[#94A3B8] p-3">{t.adminActions}</th>
								</tr>
							</thead>
							<tbody>
								{filtered.length === 0 && !loading && (
									<tr>
										<td colSpan={9} className="text-center py-12 text-[#94A3B8] text-sm">{t.adminNoResults}</td>
									</tr>
								)}
								{filtered.map((user) => (
									<Fragment key={user.id}>
										<tr className="hover:bg-[#0F172A] transition-colors border-b border-[#334155]">
											<td className="p-3">
												<button
													onClick={() => setExpanded(expanded === user.id ? null : user.id)}
													className="w-7 h-7 rounded-full bg-[#10B981] flex items-center justify-center text-white cursor-pointer hover:bg-[#059669] transition-colors"
												>
													<FontAwesomeIcon icon={expanded === user.id ? faChevronUp : faChevronDown} className="text-xs" />
												</button>
											</td>
											<td className="p-3 text-center text-xs text-[#94A3B8]">{user.id}</td>
											<td className="p-3 text-center">
												<p className="font-semibold text-xs text-[#FFFFFF]">{user.username}</p>
												{user.is_admin && <span className="text-[10px] bg-[#10B981] text-white px-1.5 py-0.5 rounded-full font-semibold">Admin</span>}
											</td>
											<td className="p-3 text-center text-xs text-[#94A3B8]">{user.email}</td>
											<td className="p-3 text-center">
												{user.last_seen
													? <span className="text-xs bg-[#0F2E2A] text-[#10B981] px-2 py-0.5 rounded-full font-semibold">{new Date(user.last_seen).toLocaleString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).replace(",", "")}</span>
													: <span className="text-xs bg-[#334155] text-[#94A3B8] px-2 py-0.5 rounded-full">—</span>
												}
											</td>
											<td className="p-3 text-center text-xs font-semibold text-[#10B981]">{user.tracking_count}</td>
											<td className="p-3 text-center text-xs text-[#94A3B8]">{new Date(user.created_at).toLocaleDateString("en-GB")}</td>
											<td className="p-3 text-center">
												{user.email_verified
													? <span className="text-xs bg-[#0F2E2A] text-[#10B981] px-2 py-0.5 rounded-full font-semibold">{t.adminVerifiedBadge}</span>
													: <span className="text-xs bg-[#854F0B] text-white px-2 py-0.5 rounded-full font-semibold">{t.adminPending}</span>
												}
											</td>
											<td className="p-3">
												<div className="flex items-center justify-center gap-1">
													<button
														onClick={() => router.push(`/admin/users/${user.id}`)}
														className="w-7 h-7 border border-[#334155] rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#10B981] hover:border-[#10B981] transition-colors cursor-pointer"
													>
														<FontAwesomeIcon icon={faEye} className="text-xs" />
													</button>
													<button
														onClick={() => setDeleteId(user.id)}
														disabled={user.is_admin}
														className="w-7 h-7 border border-[#334155] rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-red-500 hover:border-red-500 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
													>
														<FontAwesomeIcon icon={faTrash} className="text-xs" />
													</button>
												</div>
											</td>
										</tr>

										{/* Expanded row */}
										{expanded === user.id && (
											<tr key={`${user.id}-expanded`} className="bg-[#0F172A]">
												<td colSpan={9} className="px-6 py-4 border-b border-[#334155]">
													<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
														<div className="bg-[#1E293B] rounded-xl p-3 shadow-sm">
															<p className="text-xs text-[#94A3B8] mb-1">{t.adminUserId}</p>
															<p className="font-bold text-sm text-[#FFFFFF]">#{user.id}</p>
														</div>
														<div className="bg-[#1E293B] rounded-xl p-3 shadow-sm">
															<p className="text-xs text-[#94A3B8] mb-1">{t.adminTrackingCount}</p>
															<p className="font-bold text-sm text-[#10B981]">{user.tracking_count}</p>
														</div>
														<div className="bg-[#1E293B] rounded-xl p-3 shadow-sm">
															<p className="text-xs text-[#94A3B8] mb-1">DigyLog Token</p>
															<p className="font-bold text-sm text-[#FFFFFF]">{user.digylog_token ? `✅ ${t.adminConnected}` : `❌ ${t.adminNoToken}`}</p>
														</div>
														<div className="bg-[#1E293B] rounded-xl p-3 shadow-sm">
															<p className="text-xs text-[#94A3B8] mb-1">{t.adminCreatedAt}</p>
															<p className="font-bold text-sm text-[#FFFFFF]">{new Date(user.created_at).toLocaleDateString("en-GB")}</p>
														</div>
													</div>
													<div className="flex gap-2 mt-3">
														<button
															onClick={() => router.push(`/admin/users/${user.id}/orders`)}
															className="flex items-center gap-2 px-4 py-2 bg-[#10B981] text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-[#059669] transition-colors"
														>
															<FontAwesomeIcon icon={faBoxOpen} />
															{t.adminViewOrders}
														</button>
														<button
															onClick={() => router.push(`/admin/users/${user.id}/dashboard`)}
															className="flex items-center gap-2 px-4 py-2 bg-[#1E293B] border border-[#334155] text-[#94A3B8] text-xs font-semibold rounded-xl cursor-pointer hover:border-[#10B981] hover:text-[#10B981] transition-colors"
														>
															<FontAwesomeIcon icon={faChartBar} />
															{t.adminViewDashboard}
														</button>
													</div>
												</td>
											</tr>
										)}
									</Fragment>
								))}
							</tbody>
						</table>
					</div>
				</div>

			</main>

			{/* Delete Confirm Modal */}
			{delete_id && (
				<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
					<div className="bg-[#1E293B] rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4" dir={lang === "ar" ? "rtl" : "ltr"}>
						<div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
							<FontAwesomeIcon icon={faTrash} className="text-red-500 text-lg" />
						</div>
						<div className="text-center">
							<h2 className="text-lg font-bold text-[#FFFFFF]">{t.adminDeleteUser}</h2>
							<p className="text-xs text-[#94A3B8] mt-1">{t.adminDeleteDesc}</p>
						</div>
						<div className="flex gap-2">
							<button
								onClick={() => setDeleteId(null)}
								className="flex-1 border border-[#334155] rounded-xl py-2.5 text-sm font-semibold text-[#94A3B8] cursor-pointer hover:bg-[#334155] hover:text-white"
							>
								{t.cancel}
							</button>
							<button
								onClick={() => deleteUser(delete_id)}
								className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold cursor-pointer hover:bg-red-600"
							>
								{t.adminDeleteConfirm}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
