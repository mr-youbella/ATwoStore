import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function NotFound()
{
	return (
		<div className="min-h-screen bg-[#F0F2FF] flex items-center justify-center p-5">

			<div className="w-full max-w-lg bg-white rounded-2xl shadow-sm overflow-hidden">
				<div className="flex flex-col items-center text-center p-8 border-b border-gray-100">
					<div className="w-16 h-16 rounded-2xl bg-[#E2DFFF] flex items-center justify-center mb-4">
						<FontAwesomeIcon icon={faTriangleExclamation} className="text-[#4F46E5] text-2xl"/>
					</div>

					<h1 className="text-2xl font-bold text-[#1A1A2E]">404 - Page Not Found</h1>

					<p className="text-sm text-[#505F76] mt-2">The page you're looking for doesn't exist or may have been moved.</p>
				</div>

				<div className="p-6 text-center space-y-4">
					<Link href="/home" className="inline-flex items-center gap-2 bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#4338CA] transition-colors">
						<FontAwesomeIcon icon={faArrowLeft} />
						Go Home
					</Link>
				</div>
			</div>
		</div>
	);
}
