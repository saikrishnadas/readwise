"use client"

import { useRouter, useSearchParams } from 'next/navigation';

const Page = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const origin = searchParams.get("origin");

    return <div>Setting up your account...</div>
}

export default Page;