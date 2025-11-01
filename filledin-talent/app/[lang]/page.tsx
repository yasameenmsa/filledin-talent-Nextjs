import JobSearchSection from '@/components/sections/JobSearchSection';
import TrendsSection from '@/components/sections/TrendsSection';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: currentLanguage } = await params;
  return (
    <>
      <JobSearchSection />
  
   
      <TrendsSection />
    </>
  );
}
