import React from "react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";
import { db } from "../../../db/index";

interface PageProps {
	params: {
		fileid: string;
	};
}

const Page = async ({ params }: PageProps) => {
	//get the fileid
	const { fileid } = params;

	//check if the user can access the page
	const { getUser } = getKindeServerSession();
	const user = getUser();

	if (!user || !user.id) redirect(`/auth-callback?origin=dashboard/${fileid}`);

	//make db call
	const file = await db.file.findFirst({
		where: {
			id: fileid,
			userId: user.id,
		},
	});

	if (!file) notFound();

	return <div>page</div>;
};

export default Page;
