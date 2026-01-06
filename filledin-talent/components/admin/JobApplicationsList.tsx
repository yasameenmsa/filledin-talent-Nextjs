'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText } from 'lucide-react';

interface Application {
    _id: string;
    applicant: {
        _id: string;
        name: string;
        email: string;
    };
    status: 'pending' | 'interviews' | 'accepted' | 'rejected' | 'offer-accepted' | 'offer-rejected';
    cvUrl: string;
    coverLetter?: string;
    createdAt: string;
}

interface JobApplicationsListProps {
    jobId: string;
    initialApplications: Application[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function JobApplicationsList({ jobId, initialApplications }: JobApplicationsListProps) {
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>(initialApplications);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleStatusChange = async (applicationId: string, newStatus: string) => {
        setLoadingId(applicationId);
        try {
            const res = await fetch(`/api/applications/${applicationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error('Failed to update status');

            setApplications(apps =>
                apps.map(app =>
                    app._id === applicationId
                        ? { ...app, status: newStatus as Application['status'] }
                        : app
                )
            );
            router.refresh();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        } finally {
            setLoadingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'interviews': return 'bg-blue-100 text-blue-800';
            case 'accepted': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'offer-accepted': return 'bg-emerald-100 text-emerald-800';
            case 'offer-rejected': return 'bg-rose-100 text-rose-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'interviews': return 'Interviews';
            case 'accepted': return 'Accepted';
            case 'rejected': return 'Rejected';
            case 'offer-accepted': return 'Offer Accepted';
            case 'offer-rejected': return 'Offer Rejected';
            default: return status.charAt(0).toUpperCase() + status.slice(1);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Applications ({applications.length})</h2>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Applicant</TableHead>
                            <TableHead>Applied Date</TableHead>
                            <TableHead>CV</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {applications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                    No applications yet
                                </TableCell>
                            </TableRow>
                        ) : (
                            applications.map((app) => (
                                <TableRow key={app._id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{app.applicant.name || 'N/A'}</p>
                                            <p className="text-sm text-gray-500">{app.applicant.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(app.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <a
                                            href={app.cvUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-blue-600 hover:underline"
                                        >
                                            <FileText className="w-4 h-4 mr-1" />
                                            View CV
                                        </a>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(app.status)}>
                                            {getStatusLabel(app.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {loadingId === app._id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Select
                                                    value={app.status}
                                                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
                                                    className="w-[160px]"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="interviews">Interviews</option>
                                                    <option value="accepted">Accepted</option>
                                                    <option value="rejected">Rejected</option>
                                                    <option value="offer-accepted">Offer Accepted</option>
                                                    <option value="offer-rejected">Offer Rejected</option>
                                                </Select>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
