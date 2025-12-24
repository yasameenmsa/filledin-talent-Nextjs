import JobForm from '@/components/admin/JobForm';

export default async function NewJobPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    return (
        <div className="container mx-auto py-10">
            <JobForm lang={lang} />
        </div>
    );
}
