import Link from "next/link";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { redirect } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { messages } from "./lib/langs/messages";

type HeaderProps = 
{
	lang: "ar" | "en";
	name_page: string;
	toggleLang: () => void;
};

export default function Header({lang, name_page, toggleLang}: HeaderProps)
{
	const router = useRouter();
	const t = messages[lang];
	async function logout()
	{
  		await fetch("/api/auth/removeToken", { method: "POST",});
		redirect("/auth/login");
	}

	return (
		<header>
			<nav className="bg-[#1E293B] p-4">
				<div className="flex justify-between items-center xl:w-3/4 xl:mx-auto">
					<div className="flex items-center gap-3">
						<Link href="/home"><img className="w-10 h-10 rounded-full object-cover" src="/logo_A2Store.png" alt="logo" /></Link>
						<div>
							<h1 className="text-lg font-bold text-[#10B981] leading-tight">{t.storeName}</h1>
							<p className="text-[#cbd9ec] text-xs font-medium">{name_page}</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<button onClick={toggleLang} className="w-9 h-9 rounded-full bg-[#10B981] text-white text-sm font-bold cursor-pointer hover:bg-[#059669] transition-all duration-300">
							{lang === "ar" ? "EN" : "ع"}
						</button>
						<button hidden={name_page === t.loginSubtitle || name_page === t.registerSubtitle || name_page === t.verifySubtitle} onClick={() => router.push("/settings")} className="w-9 h-9 rounded-xl border border-[#334155] flex items-center justify-center text-[#94A3B8] cursor-pointer hover:border-[#10B981] hover:text-[#10B981] transition-all duration-300">
							<FontAwesomeIcon icon={faGear} className="text-sm" />
						</button>
						<button hidden={name_page === t.loginSubtitle || name_page === t.registerSubtitle} onClick={() => logout()} className="px-3 py-1.5 rounded-xl border border-[#E24B4A] text-[#E24B4A] text-xs font-semibold cursor-pointer hover:bg-[#E24B4A] hover:text-white transition-all duration-300">
							{t.logout}
						</button>
					</div>
				</div>
			</nav>
		</header>
	);
}
