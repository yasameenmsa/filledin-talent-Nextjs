import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm';

interface ForgotPasswordPageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const { lang } = await params;
  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <ForgotPasswordForm lang={lang} />
    </div>
  );
}