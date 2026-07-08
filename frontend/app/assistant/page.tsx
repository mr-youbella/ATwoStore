"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faRobot, faSpinner, faUser } from "@fortawesome/free-solid-svg-icons";
import { useLang } from "../lib/hooks/useLang";
import { messages } from "../lib/langs/messages";
import LoadingPage from "../loading";
import { checkAuth } from "../lib/auth/auth";
import Header from "../header";
import ReactMarkdown from "react-markdown";

interface Message
{
	role:    "user" | "assistant";
	content: string;
}

export default function AssistantPage()
{
	const router                             = useRouter();
	const { lang, toggleLang, lang_loading } = useLang();
	const t                                  = messages[lang];
	const [auth_loading, setAuthLoading]     = useState(true);
	const [input, setInput]                  = useState("");
	const [loading, setLoading]              = useState(false);
	const [chat, setChat]                    = useState<Message[]>([]);
	const bottom_ref                         = useRef<HTMLDivElement>(null);
	const input_ref                          = useRef<HTMLTextAreaElement>(null);
	const suggested_questions: string[] =
	[
		t.aiSuggestion1,
		t.aiSuggestion2,
		t.aiSuggestion3,
		t.aiSuggestion4,
	];

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
		bottom_ref.current?.scrollIntoView({ behavior: "smooth" });
	}, [chat]);

	async function sendMessage(text?: string)
	{
		const message = text ?? input.trim();
		if (!message || loading)
			return ;

		const new_chat: Message[] = [...chat, { role: "user", content: message }];
		setChat(new_chat);
		setInput("");
		setLoading(true);

		try
		{
			const res = await fetch("/api/assistant",
			{
				method: "POST",
				headers: {"Content-Type": "application/json",},
  				body: JSON.stringify({ chat: new_chat, lang, }),
			});
			const data = await res.json();
			setChat((prev) => [...prev, { role: "assistant", content: data.reply }]);
		}
		catch
		{
			setChat((prev) => [...prev, { role: "assistant", content: t.aiConnectionError }]);
		}
		finally
		{
			setLoading(false);
			input_ref.current?.focus();
		}
	}

	if (lang_loading || auth_loading)
		return (<LoadingPage />);
	return (
		<div className="min-h-screen bg-[#0F172A] flex flex-col" dir={lang === "ar" ? "rtl" : "ltr"}>

			<Header lang={lang} name_page={t.aiAssistant} toggleLang={toggleLang} />

			<main className="flex-1 flex flex-col xl:w-2/3 xl:mx-auto w-full p-4 gap-4">

				{/* Chat area */}
				<div className="flex-1 flex flex-col gap-3 overflow-y-auto min-h-0 pb-2">

					{/* Empty state */}
					{chat.length === 0 &&
					(
						<div className="flex-1 flex flex-col items-center justify-center gap-6 py-10">
							<div className="w-16 h-16 rounded-2xl bg-[#10B981] flex items-center justify-center shadow-lg">
								<FontAwesomeIcon icon={faRobot} className="text-white text-2xl" />
							</div>
							<div className="text-center">
								<h2 className="text-xl font-bold text-[#FFFFFF] mb-1">
									{t.aiWelcome}
								</h2>
								<p className="text-sm text-[#94A3B8]">
									{t.aiWelcomeDesc}
								</p>
							</div>

							{/* Suggested questions */}
							<div className="grid grid-cols-1 gap-2 w-full max-w-md">
								{suggested_questions.map((q, i) => (
									<button
										key={i}
										onClick={() => sendMessage(q)}
										className="text-start px-4 py-3 bg-[#1E293B] rounded-xl border border-[#334155] text-sm text-[#94A3B8] hover:border-[#10B981] hover:text-[#10B981] transition-colors cursor-pointer shadow-sm"
									>
										{q}
									</button>
								))}
							</div>
						</div>
					)}

					{/* Messages */}
					{chat.map((msg, i) => (
						<div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>

							{/* Avatar */}
							<div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-[#10B981]" : "bg-[#1E293B] border border-[#334155]"}`}>
								{ msg.role === "user" ? <FontAwesomeIcon icon={faUser} className="text-white text-xs" /> : <FontAwesomeIcon icon={faRobot} className="text-[#10B981] text-xs" /> }
							</div>

							{/* Bubble */}
							<div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
								? "bg-[#10B981] text-white rounded-tr-sm"
								: "bg-[#1E293B] text-[#FFFFFF] shadow-sm border border-[#334155] rounded-tl-sm"
							}`}>
								<ReactMarkdown>{msg.content}</ReactMarkdown>
							</div>
						</div>
					))}

					{/* Loading bubble */}
					{loading && (
						<div className="flex gap-3">
							<div className="w-8 h-8 rounded-full bg-[#1E293B] border border-[#334155] flex items-center justify-center shrink-0">
								<FontAwesomeIcon icon={faRobot} className="text-[#10B981] text-xs" />
							</div>
							<div className="bg-[#1E293B] border border-[#334155] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
								<FontAwesomeIcon icon={faSpinner} className="text-[#10B981] text-sm animate-spin" />
							</div>
						</div>
					)}

					<div ref={bottom_ref} />
				</div>

				{/* Input area */}
				<div className="bg-[#1E293B] rounded-2xl shadow-sm border border-[#334155] p-3 flex items-end gap-3">
					<textarea
						ref={input_ref}
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) =>
						{
							if (e.key === "Enter" && !e.shiftKey)
							{
								e.preventDefault();
								sendMessage();
							}
						}}
						rows={1}
						className="flex-1 outline-none text-[16px] text-[#FFFFFF] resize-none bg-transparent placeholder:text-[#94A3B8] max-h-32"
						placeholder={t.aiPlaceholder}
						style={{ minHeight: "24px" }}
					/>
					<button
						onClick={() => sendMessage()}
						disabled={!input.trim() || loading}
						className="w-9 h-9 bg-[#10B981] rounded-xl flex items-center justify-center text-white cursor-pointer hover:bg-[#059669] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
					>
						<FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
					</button>
				</div>

			</main>
		</div>
	);
}
