"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { messages } from "../langs/messages";
import { getToken } from "../cookies/get_token";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQrcode } from "@fortawesome/free-solid-svg-icons";

export default function AddTrackings({lang, setRefreshOrders, refresh_orders, check_digylog_token}: {lang: "en" | "ar", setRefreshOrders: any | null, refresh_orders: boolean | null, check_digylog_token: boolean | null})
{
	const t = messages[lang];
	const [show_add_tracking, setShowAddTracking] = useState(false);
	const [new_tracking, setNewTracking]		 = useState("");
	const [adding_tracking, setAddingTracking]   = useState(false);

	// ============= Added Traking =============
	async function handleAddTracking()
	{
		if (!new_tracking.trim())
			return;
		setAddingTracking(true);
		try
		{
			const token		 	= await getToken();
			const digylog_token = localStorage.getItem("digylog_token");
			const trackings	 	= new_tracking.split("\n").map((t) => t.trim()).filter((t) => t.length > 0);
			let success		 	= 0;
			let failed		    = 0;

			for (const tracking of trackings)
			{
				const check_res = await fetch(`/api/order/${tracking}`);
				if (!check_res.ok)
				{
					{trackings.length === 3 && toast.error(`${tracking} — ${t.trackingNotFound}`)};
					failed++;
					continue;
				}

				const res  = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/digylog_trackings`,
				{
					method:  "POST",
					headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
					body:	JSON.stringify({ tracking }),
				});
				const data = await res.json();
				if (!res.ok)
				{
					{trackings.length === 3 && toast.error(data.error || t.serverError)}
					failed++;
					continue;
				}
				success++;
			}

			if (success > 0)
			{
				toast.success(`${success} ${t.trackingAdded}`);
				setNewTracking("");
				setShowAddTracking(false);
				if (refresh_orders !== null || setRefreshOrders !== null)
					setRefreshOrders(!refresh_orders);
			}
			if (failed > 0)
				toast.error(`${failed} ${t.trackingFailed}`);
		}
		catch { toast.error(t.serverError); }
		finally { setAddingTracking(false); }
	}

	return (
		<>
			{/* Floating Button */}
			<button
				hidden={check_digylog_token ? false : true}
				onClick={() => setShowAddTracking(true)}
				className="fixed bottom-6 right-6 w-14 h-14 bg-[#10B981] text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-[#059669] transition-all duration-300 hover:scale-110 z-40">
				<FontAwesomeIcon icon={faQrcode} className="text-xl" />
			</button>
			{/* Modal Add Trackings */}
			{show_add_tracking && 
			(
				<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
					<div className="bg-[#1E293B] rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
						<h2 className="text-lg font-bold text-[#FFFFFF]">{t.addTracking}</h2>
						<p className="text-xs text-[#94A3B8]">{t.addTrackingDesc}</p>
						<textarea
							value={new_tracking}
							onChange={(e) => setNewTracking(e.target.value)}
							className="w-full border border-[#334155] bg-[#0F172A] text-[#FFFFFF] rounded-xl px-4 py-2.5 text-[16px] outline-none focus:border-[#10B981] font-mono resize-none"
							placeholder={"S3C419D5S\nSC083E91T\nS72E9022T"}
							rows={4}
						/>
						<div className="flex gap-2">
							<button
								onClick={() => { setShowAddTracking(false); setNewTracking(""); }}
								className="flex-1 border border-[#334155] rounded-xl py-2.5 text-sm font-semibold text-[#94A3B8] cursor-pointer hover:bg-[#334155] hover:text-white">
								{t.cancel}
							</button>
							<button
								onClick={handleAddTracking}
								disabled={adding_tracking || !new_tracking.trim()}
								className="flex-1 bg-[#10B981] text-white rounded-xl py-2.5 text-sm font-semibold cursor-pointer hover:bg-[#059669] disabled:opacity-60">
								{adding_tracking ? t.adding : t.add}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
