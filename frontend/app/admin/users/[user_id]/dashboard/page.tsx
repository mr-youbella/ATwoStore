import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardPage from "@/app/dashboard/page";

export default async function OrdersUser({params}: {params: Promise<{user_id: string}>})
{
	const { user_id } = await params;
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;
	if (!token)
		redirect("/auth/login");
	const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`,
	{
		headers: { "Authorization": `Bearer ${token}` }
	});
	if (!res.ok)
		redirect("/auth/login");
	const user = await res.json();
	if (!user.is_admin)
		redirect("/home");

	return (
		<div>
			<DashboardPage user_id={!Number.isNaN(parseInt(user_id, 10)) ? parseInt(user_id, 10) : undefined}/>
		</div>
	);
}
