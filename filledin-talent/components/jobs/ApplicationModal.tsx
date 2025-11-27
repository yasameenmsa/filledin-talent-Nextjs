'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApplicationModalProps {
    jobId: string;
    jobTitle: string;
    lang: string;
}

export default function ApplicationModal({ jobId, jobTitle, lang }: ApplicationModalProps) {
    const { t } = useTranslation(lang);
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [coverLetter, setCoverLetter] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCvFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cvFile) {
            toast({
                title: 'Error',
                description: 'Please upload your CV',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            // 1. Upload CV
            const formData = new FormData();
            formData.append('file', cvFile);

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadRes.ok) {
                throw new Error('Failed to upload CV');
            }

            const uploadData = await uploadRes.json();
            const cvUrl = uploadData.url;

            // 2. Submit Application
            const appRes = await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId,
                    cvUrl,
                    coverLetter,
                }),
            });

            const appData = await appRes.json();

            if (!appRes.ok) {
                throw new Error(appData.error || 'Failed to submit application');
            }

            toast({
                title: 'Success',
                description: t('applications.form.success'),
            });
            setOpen(false);
            setCvFile(null);
            setCoverLetter('');
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : t('applications.form.error'),
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-blue-900 hover:bg-blue-800">
                    {t('jobs.details.apply')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t('applications.title')}</DialogTitle>
                    <DialogDescription>
                        Applying for: <span className="font-semibold">{jobTitle}</span>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('applications.form.cv')}</label>
                        <div className="flex items-center gap-4">
                            <Input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                className="cursor-pointer"
                            />
                        </div>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX (Max 5MB)</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('applications.form.coverLetter')}</label>
                        <Textarea
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            placeholder="Tell us why you are a great fit..."
                            className="min-h-[150px]"
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            {t('applications.form.cancel')}
                        </Button>
                        <Button type="submit" disabled={loading || !cvFile}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? t('applications.form.submitting') : t('applications.form.submit')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
