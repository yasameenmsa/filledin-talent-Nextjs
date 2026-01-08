import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function AdminLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const session = await auth();
    const { lang } = await params;

    if (!session || session.user.role !== 'admin') {
        redirect(`/${lang}/login`);
    }

    return <>{children}</>;
}
