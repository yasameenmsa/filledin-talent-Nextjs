import RegisterForm from '@/components/forms/RegisterForm';

interface RegisterPageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { lang } = await params;
  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <RegisterForm lang={lang} />
    </div>
  );
}