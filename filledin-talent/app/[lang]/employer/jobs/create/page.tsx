import { Metadata } from 'next';
import { use } from 'react';
import JobPostingForm from '@/components/forms/JobPostingForm';

export const metadata: Metadata = {
  title: 'Create Job Posting | FilledIn Talent',
  description: 'Create a new job posting to find the perfect candidates for your company.',
};

interface CreateJobPageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default function CreateJobPage({ params }: CreateJobPageProps) {
  const { lang } = use(params);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <JobPostingForm lang={lang} />
      </div>
    </div>
  );
}