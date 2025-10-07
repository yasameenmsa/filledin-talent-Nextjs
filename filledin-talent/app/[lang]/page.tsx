import HeroSection from '@/components/sections/HeroSection';
import JobSearchSection from '@/components/sections/JobSearchSection';
import FeaturedJobs from '@/components/sections/FeaturedJobs';
import TrendsSection from '@/components/sections/TrendsSection';
import StatsSection from '@/components/sections/StatsSection';
import CTASection from '@/components/sections/CTASection';

export default function HomePage({ params: { lang: currentLanguage } }: { params: { lang: string } }) {
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
