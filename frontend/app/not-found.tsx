import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function NotFound()
{
	return (
		<div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-5">

			<div className="w-full max-w-lg bg-[#1E293B] rounded-2xl shadow-sm overflow-hidden">
				<div className="flex flex-col items-center text-center p-8 border-b border-[#334155]">
					<div className="w-16 h-16 rounded-2xl bg-[#0F2E2A] flex items-center justify-center mb-4">
						<FontAwesomeIcon icon={faTriangleExclamation} className="text-[#10B981] text-2xl"/>
					</div>

					<h1 className="text-2xl font-bold text-[#FFFFFF]">404 - Page Not Found</h1>

					<p className="text-sm text-[#94A3B8] mt-2">The page you're looking for doesn't exist or may have been moved.</p>
				</div>

				<div className="p-6 text-center space-y-4">
					<Link href="/home" className="inline-flex items-center gap-2 bg-[#10B981] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#059669] transition-colors">
						<FontAwesomeIcon icon={faArrowLeft} />
						Go Home
					</Link>
				</div>
			</div>
		</div>
	);
}
