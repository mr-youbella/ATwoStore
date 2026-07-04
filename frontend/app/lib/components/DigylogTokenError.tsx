"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faGear, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { messages } from "../langs/messages";

interface DigylogTokenErrorProps
{
	lang: "ar" | "en";
}

export default function DigylogTokenError( { lang }: DigylogTokenErrorProps)
{
	const router = useRouter();
	const t = messages[lang];

	return (
		<div className="flex items-center justify-center min-h-100 p-4">
			<div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full border border-red-100">

				{/* Icon */}
				<div className="flex justify-center mb-4">
					<div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
						<FontAwesomeIcon
							icon={faTriangleExclamation}
							className="text-red-500 text-3xl"
						/>
					</div>
				</div>

				{/* Title */}
				<h2 className="text-xl font-bold text-[#1A1A2E] text-center mb-2">
					{t.digylogTokenRequired}
				</h2>

				{/* Message */}
				<p className="text-[#505F76] text-center text-sm leading-relaxed mb-6">
					{t.digylogTokenNotFound}
				</p>

				{/* Description */}
				<div className="bg-[#F8F9FF] rounded-xl p-4 mb-6">
					<p className="text-xs text-[#505F76] text-center">
						{t.digylogTokenGoToSettings}
					</p>
				</div>

				{/* Button */}
				<button
					type="button"
					onClick={() => router.push("/settings")}
					className="w-full bg-[#4F46E5] text-white font-semibold text-sm py-3 rounded-xl cursor-pointer hover:bg-[#4338CA] transition-all duration-300 flex items-center justify-center gap-2">
					<FontAwesomeIcon icon={faGear} className="text-sm" />
					{t.digylogTokenGoToSettingsBtn}
					<FontAwesomeIcon icon={faArrowRight} className="text-sm" />
				</button>

			</div>
		</div>
	);
}