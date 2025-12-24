'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const applicationSchema = z.object({
    coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters'),
    cvUrl: z.string().min(1, 'CV is required'),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
    jobId: string;
    lang: string;
}

export default function ApplicationForm({ jobId, lang }: ApplicationFormProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<ApplicationFormData>({
        resolver: zodResolver(applicationSchema),
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const text = await res.text();
                console.error('Upload failed:', res.status, text);
                throw new Error('Upload failed');
            }

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await res.text();
                console.error("Received non-JSON response:", text);
                throw new Error("Received non-JSON response");
            }

            const data = await res.json();
            setUploadedFile({ name: file.name, url: data.url });
            setValue('cvUrl', data.url, { shouldValidate: true });
            toast({
                title: 'File uploaded',
                description: 'Your CV has been uploaded successfully.',
            });
        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: 'Upload failed',
                description: 'Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const onSubmit = async (data: ApplicationFormData) => {
        setIsSubmitting(true);
        try {
            // TODO: Implement application submission API
            // const res = await fetch('/api/applications', { ... });

            // For now, simulate success
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast({
                title: 'Application submitted',
                description: 'Good luck! We will review your application shortly.',
            });

            router.push(`/${lang}/jobs/${jobId}`);
        } catch (error) {
            console.error('Application error:', error);
            toast({
                title: 'Application failed',
                description: 'Please try again later.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
                <Label htmlFor="cv">Upload CV / Resume</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                    {uploadedFile ? (
                        <div className="flex items-center justify-center gap-4">
                            <FileText className="h-8 w-8 text-blue-600" />
                            <div className="text-left">
                                <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                                <p className="text-sm text-green-600">Uploaded successfully</p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setUploadedFile(null);
                                    setValue('cvUrl', '');
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <>
                            <input
                                type="file"
                                id="cv"
                                className="hidden"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileUpload}
                                disabled={isUploading}
                            />
                            <label htmlFor="cv" className="cursor-pointer">
                                {isUploading ? (
                                    <Loader2 className="h-8 w-8 mx-auto text-gray-400 animate-spin" />
                                ) : (
                                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                                )}
                                <p className="mt-2 text-sm text-gray-600 font-medium">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    PDF, DOC, DOCX up to 5MB
                                </p>
                            </label>
                        </>
                    )}
                </div>
                {errors.cvUrl && (
                    <p className="text-sm text-red-600">{errors.cvUrl.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="coverLetter">Cover Letter</Label>
                <Textarea
                    id="coverLetter"
                    placeholder="Tell us why you're a great fit for this role..."
                    className="min-h-[200px]"
                    {...register('coverLetter')}
                />
                {errors.coverLetter && (
                    <p className="text-sm text-red-600">{errors.coverLetter.message}</p>
                )}
            </div>

            <Button
                type="submit"
                className="w-full bg-blue-900 hover:bg-blue-800"
                disabled={isSubmitting || isUploading}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting Application...
                    </>
                ) : (
                    'Submit Application'
                )}
            </Button>
        </form>
    );
}
