import Link from "next/link";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { redirect } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";

type HeaderProps = 
{
	t: any;
	lang: "ar" | "en";
	namePage: string;
	toggleLang: () => void;
};

export default function Header({t, lang, namePage, toggleLang}: HeaderProps)
{
	const router = useRouter();
	async function logout()
	{
  		await fetch("/api/auth/removeToken", { method: "POST",});
		redirect("/auth/login");
	}

	return (
		<header>
			<nav className="bg-[#E2DFFF] p-4">
				<div className="flex justify-between items-center xl:w-3/4 xl:mx-auto">
					<div className="flex items-center gap-3">
						<Link href="/home"><img className="w-10 h-10 rounded-full object-cover" src="/logo_A2Store.png" alt="logo" /></Link>
						<div>
							<h1 className="text-lg font-bold text-[#3323CC] leading-tight">{t.storeName}</h1>
							<p className="text-[#68788F] text-xs font-medium">{namePage}</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={toggleLang}
							className="w-9 h-9 rounded-full bg-[#4F46E5] text-white text-sm font-bold cursor-pointer hover:bg-[#4338CA] transition-all duration-300">
							{lang === "ar" ? "EN" : "ع"}
						</button>
						<button
							onClick={() => router.push("/settings")}
							className="w-9 h-9 rounded-xl border border-gray-300 flex items-center justify-center text-[#505F76] cursor-pointer hover:border-[#4F46E5] hover:text-[#4F46E5] transition-all duration-300">
							<FontAwesomeIcon icon={faGear} className="text-sm" />
						</button>
						<button
							onClick={() => logout()}
							className="px-3 py-1.5 rounded-xl border border-[#E24B4A] text-[#E24B4A] text-xs font-semibold cursor-pointer hover:bg-[#E24B4A] hover:text-white transition-all duration-300">
							{t.logout}
						</button>
					</div>
				</div>
			</nav>
		</header>
	);
}
