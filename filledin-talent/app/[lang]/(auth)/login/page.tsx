import LoginForm from '@/components/forms/LoginForm';

interface LoginPageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { lang } = await params;
  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <LoginForm lang={lang} />
    </div>
  );
}