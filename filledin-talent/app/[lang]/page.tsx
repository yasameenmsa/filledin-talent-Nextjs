import HeroSection from '@/components/sections/HeroSection';
import JobSearchSection from '@/components/sections/JobSearchSection';
import FeaturedJobs from '@/components/sections/FeaturedJobs';
import TrendsSection from '@/components/sections/TrendsSection';
import StatsSection from '@/components/sections/StatsSection';
import CTASection from '@/components/sections/CTASection';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: currentLanguage } = await params;
  return (
    <>
<JobSearchSection currentLanguage={currentLanguage} />
      <HeroSection />
      <StatsSection />
      <FeaturedJobs />
      <TrendsSection />
      <CTASection />
    </>
  );
}
