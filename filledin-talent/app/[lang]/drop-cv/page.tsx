import React from 'react';
import DropCVSection from '@/components/sections/DropCVSection';

export const metadata = {
    title: 'Drop Your CV | FilledIn Talent',
    description: 'Upload your CV and join our talent pool.',
};

export default function DropCVPage() {
    return (
        <main>
            <DropCVSection />
        </main>
    );
}
