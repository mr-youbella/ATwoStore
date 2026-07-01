import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const handler = NextAuth
({
	providers:
	[
		GoogleProvider
		({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
	],
	secret: process.env.NEXTAUTH_SECRET,
	callbacks: 
	{
    	async signIn({ user, account })
		{
			try
			{
				const res = await fetch(`${BACKEND_URL}/auth/google`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json", },
					body: JSON.stringify({ id: account?.id_token }),
				});
				if (!res.ok)
					return ("/auth/login?error=google_failed");

				const data = await res.json();
				const cookieStore = await cookies();
				cookieStore.set("token", data.token,
				{
					httpOnly: true,
					secure: process.env.NODE_ENV === "production",
					sameSite: "lax",
					maxAge: 60 * 60 * 24 * 7,
					path: "/",
				});
				return (true);
			}
			catch
			{
				return ("/auth/login?error=server_error");
			}
		},
	},
});

export { handler as GET, handler as POST };
