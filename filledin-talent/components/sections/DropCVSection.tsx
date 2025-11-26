'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';

const DropCVSection = () => {
    const { currentLanguage, isRTL } = useLanguage();
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const translations = {
        en: {
            title: 'Drop Your CV',
            subtitle: 'Join our talent pool and let opportunities find you.',
            nameLabel: 'Full Name',
            emailLabel: 'Email Address',
            dragDrop: 'Drag & drop your CV here',
            or: 'or',
            browse: 'Browse Files',
            supportedFormats: 'Supported formats: PDF, DOC, DOCX (Max 5MB)',
            submit: 'Submit Application',
            submitting: 'Submitting...',
            successTitle: 'CV Uploaded Successfully!',
            successMessage: 'Thank you for sharing your profile. We will contact you if a suitable opportunity arises.',
            errorTitle: 'Upload Failed',
            uploadAnother: 'Upload Another CV',
            removeFile: 'Remove file'
        },
        fr: {
            title: 'Déposez votre CV',
            subtitle: 'Rejoignez notre vivier de talents et laissez les opportunités venir à vous.',
            nameLabel: 'Nom complet',
            emailLabel: 'Adresse e-mail',
            dragDrop: 'Glissez et déposez votre CV ici',
            or: 'ou',
            browse: 'Parcourir les fichiers',
            supportedFormats: 'Formats supportés : PDF, DOC, DOCX (Max 5MB)',
            submit: 'Soumettre la candidature',
            submitting: 'Envoi en cours...',
            successTitle: 'CV téléchargé avec succès !',
            successMessage: 'Merci d\'avoir partagé votre profil. Nous vous contacterons si une opportunité correspondante se présente.',
            errorTitle: 'Échec du téléchargement',
            uploadAnother: 'Télécharger un autre CV',
            removeFile: 'Supprimer le fichier'
        },
        ar: {
            title: 'أرسل سيرتك الذاتية',
            subtitle: 'انضم إلى مجموعة المواهب لدينا ودع الفرص تجدك.',
            nameLabel: 'الاسم الكامل',
            emailLabel: 'البريد الإلكتروني',
            dragDrop: 'اسحب وأفلت سيرتك الذاتية هنا',
            or: 'أو',
            browse: 'تصفح الملفات',
            supportedFormats: 'تنسيقات مدعومة: PDF, DOC, DOCX (الحد الأقصى 5 ميجابايت)',
            submit: 'تقديم الطلب',
            submitting: 'جاري الإرسال...',
            successTitle: 'تم رفع السيرة الذاتية بنجاح!',
            successMessage: 'شكراً لمشاركة ملفك الشخصي. سنتصل بك إذا ظهرت فرصة مناسبة.',
            errorTitle: 'فشل التحميل',
            uploadAnother: 'تحميل سيرة ذاتية أخرى',
            removeFile: 'إزالة الملف'
        }
    };

    const t = translations[currentLanguage as keyof typeof translations] || translations.en;

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const validateFile = (file: File) => {
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
            setMessage('Invalid file type. Please upload PDF or Word document.');
            setStatus('error');
            return false;
        }
        if (file.size > 5 * 1024 * 1024) {
            setMessage('File size exceeds 5MB limit.');
            setStatus('error');
            return false;
        }
        return true;
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (validateFile(droppedFile)) {
                setFile(droppedFile);
                setStatus('idle');
                setMessage('');
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (validateFile(selectedFile)) {
                setFile(selectedFile);
                setStatus('idle');
                setMessage('');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !name || !email) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', name);
        formData.append('email', email);
        formData.append('language', currentLanguage);

        try {
            const response = await fetch('/api/drop-cv', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setFile(null);
                setName('');
                setEmail('');
            } else {
                setStatus('error');
                setMessage(data.error || 'Something went wrong');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStatus('idle');
        setFile(null);
        setName('');
        setEmail('');
        setMessage('');
    };

    return (
        <section className="py-20 px-4 bg-gray-50 min-h-[80vh] flex items-center justify-center">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 md:p-12">

                    {status === 'success' ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.successTitle}</h2>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">{t.successMessage}</p>
                            <button
                                onClick={resetForm}
                                className="px-8 py-3 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152a45] transition-colors font-medium"
                            >
                                {t.uploadAnother}
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-10">
                                <h1 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">{t.title}</h1>
                                <p className="text-gray-600 text-lg">{t.subtitle}</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name Input */}
                                <div>
                                    <label htmlFor="name" className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-left' : 'text-right'}`}>
                                        {t.nameLabel}
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent outline-none transition-all ${isRTL ? 'text-left' : 'text-right'}`}
                                        placeholder={currentLanguage === 'ar' ? 'الاسم الكامل' : 'John Doe'}
                                    />
                                </div>

                                {/* Email Input */}
                                <div>
                                    <label htmlFor="email" className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-left' : 'text-right'}`}>
                                        {t.emailLabel}
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent outline-none transition-all ${isRTL ? 'text-left' : 'text-right'}`}
                                        placeholder="john@example.com"
                                        dir="ltr"
                                    />
                                </div>

                                {/* File Upload Area */}
                                <div className="space-y-2">
                                    <div
                                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive
                                            ? 'border-[#1e3a5f] bg-blue-50'
                                            : file
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            ref={inputRef}
                                            type="file"
                                            className="hidden"
                                            onChange={handleChange}
                                            accept=".pdf,.doc,.docx"
                                        />

                                        {file ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <FileText className="w-8 h-8 text-green-600" />
                                                <div className="text-start">
                                                    <p className="font-medium text-gray-900">{file.name}</p>
                                                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFile(null)}
                                                    className="p-1 hover:bg-red-100 rounded-full text-red-500 transition-colors ms-2"
                                                    title={t.removeFile}
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                                    <Upload className="w-8 h-8 text-[#1e3a5f]" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-medium text-gray-900">
                                                        {t.dragDrop}
                                                    </p>
                                                    <p className="text-gray-500 my-2">{t.or}</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => inputRef.current?.click()}
                                                        className="text-[#1e3a5f] font-semibold hover:underline"
                                                    >
                                                        {t.browse}
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-400">
                                                    {t.supportedFormats}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Error Message */}
                                {status === 'error' && (
                                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <p className="text-sm">{message}</p>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading || !file || !name || !email}
                                    className={`w-full py-4 rounded-lg font-bold text-white transition-all transform hover:scale-[1.01] active:scale-[0.99] ${loading || !file || !name || !email
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-[#1e3a5f] hover:bg-[#152a45] shadow-lg hover:shadow-xl'
                                        }`}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {t.submitting}
                                        </span>
                                    ) : (
                                        t.submit
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default DropCVSection;
