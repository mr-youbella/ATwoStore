import { useState, useEffect } from "react";
import { Lang } from "../langs/messages";

export function useLang(defaultLang: Lang = "en")
{
	const [lang, setLang] = useState<Lang>(defaultLang);
	const [lang_loading, setLangLoading] = useState<boolean>(true);

	const applyLang = (lang: Lang) =>
	{
		if (typeof document !== "undefined")
		{
			document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
			document.documentElement.lang = lang;
		}
	};

	useEffect(() =>
	{
		if (typeof window !== "undefined")
		{
			const saved = localStorage.getItem("lang") as Lang;
			
			if (saved && (saved === "ar" || saved === "en"))
			{
				setLang(saved);
				applyLang(saved);
			}
			else
				applyLang(defaultLang);
		}
		setLangLoading(false);
	}, []);

	const toggleLang = () =>
	{
		const newLang = lang === "ar" ? "en" : "ar";
		setLang(newLang);
		localStorage.setItem("lang", newLang);
		applyLang(newLang);
	};

	return { lang, toggleLang, lang_loading };
}
