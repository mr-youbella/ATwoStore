"use client";
import { useLang } from "./lib/hooks/useLang";
import { messages } from "./lib/langs/messages";

export default function LoadingPage()
{
	const { lang } = useLang();
	const t = messages[lang];

	return (
		<div className="min-h-screen bg-[#F0F2FF] flex items-center justify-center p-4" dir={lang === "ar" ? "rtl" : "ltr"}>
			<div className="w-full max-w-md">
				<div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">

					{/* Logo */}
					<div className="flex flex-col items-center">
						<div className="w-20 h-20 rounded-full bg-[#E2DFFF] flex items-center justify-center mb-4 animate-pulse">
							<div className="w-12 h-12 rounded-full bg-[#4F46E5]/20"></div>
						</div>
						<h1 className="text-2xl font-bold text-[#3323CC]">{t.storeName || "A Two Store"}</h1>
					</div>

					{/* Loading Spinner */}
					<div className="flex flex-col items-center space-y-4">
						<div className="relative">
							<div className="w-16 h-16 border-4 border-[#E2DFFF] rounded-full"></div>
							<div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#4F46E5] rounded-full border-t-transparent animate-spin"></div>
						</div>

						<div className="space-y-2 text-center">
							<p className="text-[#1A1A2E] font-semibold text-lg">{t.loading}</p>
							<div className="flex items-center justify-center gap-1">
								<div className="w-2 h-2 bg-[#4F46E5] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
								<div className="w-2 h-2 bg-[#4F46E5] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
								<div className="w-2 h-2 bg-[#4F46E5] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
							</div>
						</div>

						{/* Progress Bar */}
						<div className="w-full max-w-xs">
							<div className="h-1.5 bg-[#F0F2FF] rounded-full overflow-hidden">
								<div className="h-full bg-[#4F46E5] rounded-full animate-progress"></div>
							</div>
						</div>
					</div>

				</div>
			</div>
		</div>
	);
}
