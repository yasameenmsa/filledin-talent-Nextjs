'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface SaveJobButtonProps {
    jobId: string;
    initialSaved?: boolean;
    lang: string;
}

export default function SaveJobButton({ jobId, initialSaved = false, lang }: SaveJobButtonProps) {
    const { t } = useTranslation(lang);
    const { toast } = useToast();
    const [saved, setSaved] = useState(initialSaved);
    const [loading, setLoading] = useState(false);

    // Ideally, we should check initialSaved status from server if not provided, 
    // but for now we rely on prop or check on mount if needed.
    // Since checking on every card is expensive, we might just handle the toggle.

    const toggleSave = async () => {
        setLoading(true);
        try {
            if (saved) {
                // Unsave
                const res = await fetch(`/api/saved-jobs?jobId=${jobId}`, {
                    method: 'DELETE',
                });
                if (!res.ok) throw new Error('Failed to unsave');
                setSaved(false);
                toast({ title: 'Job removed from saved items' });
            } else {
                // Save
                const res = await fetch('/api/saved-jobs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jobId }),
                });
                if (!res.ok) throw new Error('Failed to save');
                setSaved(true);
                toast({ title: 'Job saved successfully' });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: 'Something went wrong',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={toggleSave}
            disabled={loading}
            className={saved ? 'text-blue-600 border-blue-600 bg-blue-50' : ''}
        >
            <Bookmark className={`w-4 h-4 mr-2 ${saved ? 'fill-current' : ''}`} />
            {saved ? t('jobs.actions.saved') : t('jobs.actions.save')}
        </Button>
    );
}
