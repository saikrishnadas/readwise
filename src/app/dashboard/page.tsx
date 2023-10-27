import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import { db } from "@/db";
import { getUserSubscriptionPlan } from "@/lib/stripe";

const Page = async () => {
	const { getUser } = getKindeServerSession();
	const user = getUser();
	console.log(user);

	if (!user || !user.id) return redirect("/auth-callback?origin=dashboard");

	const dbUser = await db.user.findFirst({
		where: {
			id: user.id,
		},
	});

	if (!dbUser) return redirect("/auth-callback?origin=dashboard");

	const subscriptionPlan = await getUserSubscriptionPlan();

	return <Dashboard subscriptionPlan={subscriptionPlan} />;
};

export default Page;
