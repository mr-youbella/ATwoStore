import { NextRequest, NextResponse } from "next/server";
import { messages } from "../../lib/langs/messages";
import { cookies } from "next/headers";

async function getOrderByTracking(tracking: string)
{
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value || null;
	const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/orders/${tracking}`, {headers: { "Authorization": `Bearer ${token}` }});
	if (!res.ok)
	{
		const res = await fetch(`${process.env.APP_URL}/api/order/${tracking}`);
		if (!res.ok)
			return (null);
		const order = await res.json();
		return (order);
	}
	const order = await res.json();
	return (order);
}

interface Message 
{
	role: "user" | "assistant";
	content: string;
}

const MODELS =
[
	"openrouter/owl-alpha",
	"nvidia/nemotron-3-ultra-550b-a55b:free",
	"poolside/laguna-m.1:free",
	"nvidia/nemotron-3-super-120b-a12b:free",
	"openai/gpt-oss-120b:free",
	"cohere/north-mini-code:free",
	"poolside/laguna-xs.2:free",
	"google/gemma-4-31b-it:free",
	"nvidia/nemotron-3-nano-30b-a3b:free",
	"openai/gpt-oss-20b:free",
	"nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
	"nvidia/nemotron-nano-9b-v2:free",
	"nvidia/nemotron-nano-12b-v2-vl:free",
	"google/gemma-4-26b-a4b-it:free",
	"liquid/lfm-2.5-1.2b-thinking:free",
	"liquid/lfm-2.5-1.2b-instruct:free",
	"nvidia/nemotron-3.5-content-safety:free",
	"qwen/qwen3-next-80b-a3b-instruct:free",
	"meta-llama/llama-3.3-70b-instruct:free",
	"cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
	"meta-llama/llama-3.2-3b-instruct:free",
	"nousresearch/hermes-3-llama-3.1-405b:free",
	"qwen/qwen3-coder:free",
];

async function toolCalling(chat: Message[])
{
	const tool_calling_prompt =
	`
		Order Lookup Rule

		If the user asks for any information about a specific order and includes a tracking number in their message, do NOT answer the question.

		Instead, respond ONLY with a valid JSON object in exactly this format:

		{
		  "action": "get_order_by_tracking",
		  "parameters": {
		    "tracking_number": "<tracking_number>"
		  }
		}

		Rules:
		- Extract the tracking number exactly as provided by the user.
		- Return ONLY the JSON object.
		- Do NOT use markdown.
		- Do NOT add explanations or extra text.
		- Do NOT invent or guess a tracking number.
		- If the user asks about an order but does not provide a tracking number, ask them to provide the tracking number instead of returning JSON.

		Examples:

		User: Where is my order TRK123456?
		Response:
		{
		  "action": "get_order_by_tracking",
		  "parameters": {
		    "tracking_number": "TRK123456"
		  }
		}

		User: Give me details about tracking ABC987654.
		Response:
		{
		  "action": "get_order_by_tracking",
		  "parameters": {
		    "tracking_number": "ABC987654"
		  }
		}

		User: أين طلبي رقم DG548721؟
		Response:
		{
		  "action": "get_order_by_tracking",
		  "parameters": {
		    "tracking_number": "DG548721"
		  }
		}

		User: Show my order.
		Response:
		Please provide the tracking number of the order.
	`;

	for (const model of MODELS)
	{
		try
		{
			const res = await fetch("https://openrouter.ai/api/v1/chat/completions",
			{
				method: "POST",
				headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.ASSISTANT_API}`,},
				body: JSON.stringify
				({
					model,
					max_tokens: 500,
					messages: 
					[
						{ role: "system", content: tool_calling_prompt, },
						...chat.slice(-10),
					],
					reasoning: { enabled: false, },
				}),
			});

			if (!res.ok)
				throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			const reply = data.choices?.[0]?.message.content ?? null;
			if (reply)
				return (reply);
		}
		catch (err)
		{}
	}
	throw new Error("All models failed.");
}

async function getInfo(chat: Message[])
{
	try
	{
		const reply = await toolCalling(chat);
		if (reply)
		{		
			const action = JSON.parse(reply);
			switch (action.action)
			{
				case "get_order_by_tracking":
				{
					const tracking = action.parameters?.tracking_number;
					const order = await getOrderByTracking(tracking);
					return (JSON.stringify(order));
				}
				default:
					return reply;
			}
		}
	}
	catch
	{}
}

async function askAssistant(chat: Message[], lang: "ar" | "en"): Promise<string>
{
	const t             = messages[lang];
	const info = await getInfo(chat);
	const system_prompt =
	`
		You are the official AI assistant for "A Two Store", a logistics and order management platform.

		Your role is to help users understand and use the platform. You answer questions, explain features, guide users through workflows, and assist with order management. Never invent data, orders, profits, or account information. If the user asks for information that requires access to their account, tell them that the application must provide that information through available tools or APIs.

		Language Rules:
		- The current language is "${lang}".
		- If the variable "lang" equals "ar", always respond in Arabic.
		- If the variable "lang" equals "en", always respond in English.
		- If the language value is missing, respond in the same language used by the user.

		Platform Features:
		A Two Store allows users to:
		- Create personal orders.
		- Create delivery orders that are sent directly to Digylog.
		- View all their orders in one place, including personal orders and Digylog orders.
		- Automatically display orders that were created directly inside Digylog.
		- Manage Digylog orders, including requesting delivery, tracking status, and cancelling orders when allowed.
		- View dashboards containing profits, delivery fees, deductions, and financial reports.
		- Filter reports by month, year, or all time.
		- Manage customers, addresses, and order information.
		- Monitor order statuses and delivery progress.

		Behavior:
		- Be professional, friendly, and concise.
		- Give step-by-step instructions when appropriate.
		- If the user asks how to perform an action, explain the steps clearly.
		- If you do not know something or lack access, say so honestly.
		- Never fabricate prices, financial statistics, delivery statuses, or account data.
		- Do not claim an order exists unless the application provides that information.
		- Ask clarifying questions if the user's request is ambiguous.
		- Prefer short, practical answers over long explanations.
		- Format complex information using bullet points or numbered lists.

		When discussing orders, use terminology such as:
		- Personal Order
		- Digylog Order
		- Order Status
		- Delivery Request
		- Cancel Order
		- Tracking Number
		- Customer
		- Courier
		- Profit
		- Delivery Fee
		- Deduction
		- Monthly Report
		- Annual Report
		- Dashboard

		If the application provides structured data, base your response only on that data. Do not infer or invent missing values.
		Your purpose is to help users use A Two Store efficiently and accurately while providing reliable guidance.
		IMPORTANT:
		Do not use Markdown tables under any circumstances.
		Do not use "|" characters or table formatting.
		Always return plain text with one field per line and bullet points for lists.

		and take this information for answers: ${info}
	`;

	for (const model of MODELS)
	{
		try
		{
			const res = await fetch("https://openrouter.ai/api/v1/chat/completions",
			{
				method: "POST",
				headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.ASSISTANT_API}`,},
				body: JSON.stringify
				({
					model,
					max_tokens: 500,
					messages: 
					[
						{ role: "system", content: system_prompt, },
						...chat.slice(-10),
					],
					reasoning: { enabled: false, },
				}),
			});

			if (!res.ok)
				throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			const reply = data.choices?.[0]?.message.content ?? t.aiError;
			if (reply)
				return (reply);
		}
		catch (err)
		{}
	}
	throw new Error("All models failed.");
}

export async function POST(req: NextRequest)
{
	try
	{
		const { chat, lang } = await req.json();
		const reply = await askAssistant(chat, lang);
		return (NextResponse.json({ reply }));
	}
	catch (error: any)
	{
		return NextResponse.json({ error: error.message ?? "Unknown error", }, { status: 500 });
	}
}
