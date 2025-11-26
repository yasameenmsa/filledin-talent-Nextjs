import CommitmentSection from '@/components/sections/CommitmentSection';
import DataDrivenSection  from '@/components/sections/DataDrivenSection';
import JobSeekersSection from '@/components/sections/JobSeekersSection';
import InterviewTipsSection from '@/components/sections/InterviewTipsSection';
import InterviewSuccessSection from '@/components/sections/InterviewSuccessSection';
import STARMethodSection from '@/components/sections/STARMethodSection';
export default function TrendsPage() {
  return (
    <div>
     <div className="bg-[#F7FA] font-bold text-[#0] flex justify-center items-center py-12">CommitmentSection 7 for /businesses/engagement </div>

      <CommitmentSection />
      <div className="bg-[#F7FA] font-bold text-[#0] flex justify-center items-center py-12">DataDrivenSection 8 /businesses/engagement</div>
      <DataDrivenSection  />
      <div className="bg-[#F7FA] font-bold text-[#000] flex justify-center items-center py-12">JobSeekersSection 9</div>
      <JobSeekersSection />
      <div className="bg-[#F7FA] font-bold text-[#000] flex justify-center items-center py-12">InterviewTipsSection 10</div>
      <InterviewTipsSection />
      <div className="bg-[#F7FA] font-bold text-[#000] flex justify-center items-center py-12">InterviewSuccessSection 11</div>
      <InterviewSuccessSection />
      <div className="bg-[#F7FA] font-bold text-[#000] flex justify-center items-center py-12">STARMethodSection 12</div>
      <STARMethodSection />
    </div>
  );
}