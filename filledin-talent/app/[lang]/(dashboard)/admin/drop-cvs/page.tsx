'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    FileText,
    Search,
    Download,
    RefreshCw,
    Calendar,
    Mail,
    User,
    Globe,
    Eye
} from 'lucide-react';

interface CV {
    _id: string;
    name: string;
    email: string;
    originalName: string;
    language: string;
    createdAt: string;
    userId?: {
        _id: string;
        name: string;
        email: string;
    };
}

export default function AdminDropCVsPage() {
    const { currentLanguage } = useLanguage();
    const [cvs, setCvs] = useState<CV[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const translations = {
        en: {
            title: 'Dropped CVs',
            subtitle: 'Manage and download CVs submitted by candidates.',
            searchPlaceholder: 'Search by name or email...',
            refresh: 'Refresh',
            name: 'Name',
            email: 'Email',
            date: 'Submitted Date',
            language: 'Language',
            actions: 'Actions',
            download: 'Download',
            view: 'View',
            noCVs: 'No CVs found.',
            loading: 'Loading...'
        },
        fr: {
            title: 'CVs Déposés',
            subtitle: 'Gérer et télécharger les CVs soumis par les candidats.',
            searchPlaceholder: 'Rechercher par nom ou email...',
            refresh: 'Actualiser',
            name: 'Nom',
            email: 'Email',
            date: 'Date de soumission',
            language: 'Langue',
            actions: 'Actions',
            download: 'Télécharger',
            view: 'Voir',
            noCVs: 'Aucun CV trouvé.',
            loading: 'Chargement...'
        },
        ar: {
            title: 'السير الذاتية المودعة',
            subtitle: 'إدارة وتنزيل السير الذاتية المقدمة من المرشحين.',
            searchPlaceholder: 'البحث عن طريق الاسم أو البريد الإلكتروني...',
            refresh: 'تحديث',
            name: 'الاسم',
            email: 'البريد الإلكتروني',
            date: 'تاريخ التقديم',
            language: 'الغة',
            actions: 'إجراءات',
            download: 'تحميل',
            view: 'عرض',
            noCVs: 'لم يتم العثور على سير ذاتية.',
            loading: 'جاري التحميل...'
        }
    };

    const t = translations[currentLanguage as keyof typeof translations] || translations.en;

    const fetchCVs = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/drop-cv');
            if (response.ok) {
                const data = await response.json();
                setCvs(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching CVs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCVs();
    }, []);

    const filteredCVs = cvs.filter(cv =>
        cv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cv.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDownload = (id: string, fileName: string) => {
        // Create a temporary link to start the download
        const link = document.createElement('a');
        link.href = `/api/admin/drop-cv/${id}/download`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <FileText className="w-8 h-8 mr-3 text-blue-600" />
                                {t.title}
                            </h1>
                            <p className="text-gray-600 mt-2">
                                {t.subtitle}
                            </p>
                        </div>
                        <button
                            onClick={fetchCVs}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            {t.refresh}
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder={t.searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* CVs Table */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600">{t.loading}</p>
                        </div>
                    ) : filteredCVs.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            {t.noCVs}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t.name}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t.email}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t.language}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t.date}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t.actions}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredCVs.map((cv) => (
                                        <tr key={cv._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                                        <User className="w-5 h-5" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{cv.name}</div>
                                                        {cv.userId && (
                                                            <div className="text-xs text-green-600 flex items-center mt-1">
                                                                Running User
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                                    {cv.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <Globe className="w-4 h-4 mr-2 text-gray-400" />
                                                    {cv.language ? cv.language.toUpperCase() : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                    {new Date(cv.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                <div className="flex items-center space-x-3">
                                                    <a
                                                        href={`/api/admin/drop-cv/${cv._id}/download?view=true`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-orange-600 hover:text-orange-900 flex items-center bg-orange-50 px-3 py-1.5 rounded-md hover:bg-orange-100 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4 mr-1.5" />
                                                        {t.view}
                                                    </a>
                                                    <button
                                                        onClick={() => handleDownload(cv._id, cv.originalName || 'cv.pdf')}
                                                        className="text-blue-600 hover:text-blue-900 flex items-center bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors"
                                                    >
                                                        <Download className="w-4 h-4 mr-1.5" />
                                                        {t.download}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
