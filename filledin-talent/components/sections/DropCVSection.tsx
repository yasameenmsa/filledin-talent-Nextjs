'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';

const DropCVSection = () => {
    const { currentLanguage, isRTL } = useLanguage();
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const translations = {
        en: {
            joinNetwork: 'Join Our Talent Network',
            title: 'Drop Your CV',
            subtitle: 'Join our exclusive talent pool. Let the best opportunities find you.',
            firstNameLabel: 'First Name',
            lastNameLabel: 'Last Name',
            emailLabel: 'Email Address',
            dragDrop: 'Drag & drop your CV here',
            or: 'or',
            browse: 'Browse Files',
            supportedFormats: 'Supported formats: PDF, DOC, DOCX (Max 5MB)',
            submit: 'Submit Application',
            submitting: 'Uploading...',
            successTitle: 'CV Uploaded Successfully!',
            successMessage: 'Thank you for sharing your profile. We will contact you if a suitable opportunity arises.',
            errorTitle: 'Upload Failed',
            uploadAnother: 'Upload Another CV',
            removeFile: 'Remove file',
            fileType: 'Invalid file type. Please upload PDF or Word document.',
            fileSize: 'File size exceeds 5MB limit.',
        },
        fr: {
            joinNetwork: 'Rejoignez notre réseau de talents',
            title: 'Déposez votre CV',
            subtitle: 'Rejoignez notre vivier de talents exclusif. Laissez les meilleures opportunités venir à vous.',
            firstNameLabel: 'Prénom',
            lastNameLabel: 'Nom',
            emailLabel: 'Adresse e-mail',
            dragDrop: 'Glissez et déposez votre CV ici',
            or: 'ou',
            browse: 'Parcourir les fichiers',
            supportedFormats: 'Formats supportés : PDF, DOC, DOCX (Max 5MB)',
            submit: 'Soumettre la candidature',
            submitting: 'Téléchargement...',
            successTitle: 'CV téléchargé avec succès !',
            successMessage: 'Merci d\'avoir partagé votre profil. Nous vous contacterons si une opportunité correspondante se présente.',
            errorTitle: 'Échec du téléchargement',
            uploadAnother: 'Télécharger un autre CV',
            removeFile: 'Supprimer le fichier',
            fileType: 'Type de fichier invalide. Veuillez télécharger un document PDF ou Word.',
            fileSize: 'La taille du fichier dépasse la limite de 5 Mo.',
        },
        ar: {
            joinNetwork: 'انضم إلى شبكة المواهب لدينا',
            title: 'أرسل سيرتك الذاتية',
            subtitle: 'انضم إلى مجموعة المواهب الحصرية لدينا. دع أفضل الفرص تجدك.',
            firstNameLabel: 'الاسم الأول',
            lastNameLabel: 'الاسم الأخير',
            emailLabel: 'البريد الإلكتروني',
            dragDrop: 'اسحب وأفلت سيرتك الذاتية هنا',
            or: 'أو',
            browse: 'تصفح الملفات',
            supportedFormats: 'تنسيقات مدعومة: PDF, DOC, DOCX (الحد الأقصى 5 ميجابايت)',
            submit: 'تقديم الطلب',
            submitting: 'جاري التحميل...',
            successTitle: 'تم رفع السيرة الذاتية بنجاح!',
            successMessage: 'شكراً لمشاركة ملفك الشخصي. سنتصل بك إذا ظهرت فرصة مناسبة.',
            errorTitle: 'فشل التحميل',
            uploadAnother: 'تحميل سيرة ذاتية أخرى',
            removeFile: 'إزالة الملف',
            fileType: 'نوع الملف غير صالح. يرجى تحميل مستند PDF أو Word.',
            fileSize: 'حجم الملف يتجاوز حد 5 ميجابايت.',
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
            setMessage(t.fileType);
            setStatus('error');
            return false;
        }
        if (file.size > 5 * 1024 * 1024) {
            setMessage(t.fileSize);
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
        if (!file || !firstName || !lastName || !email) return;

        setLoading(true);
        setUploadProgress(10); // Start progress
        const formData = new FormData();
        const fullName = `${firstName} ${lastName}`.trim();
        formData.append('file', file);
        formData.append('name', fullName);
        formData.append('email', email);
        formData.append('language', currentLanguage);

        try {
            // Simulate progress for UX
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const response = await fetch('/api/drop-cv', {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            const data = await response.json();

            if (response.ok) {
                // Add a small delay for the user to see 100%
                setTimeout(() => {
                    setStatus('success');
                    setFile(null);
                    setFirstName('');
                    setLastName('');
                    setEmail('');
                    setUploadProgress(0);
                }, 500);
            } else {
                setStatus('error');
                setMessage(data.error || 'Something went wrong');
                setUploadProgress(0);
            }
        } catch {
            setStatus('error');
            setMessage('Network error. Please try again.');
            setUploadProgress(0);
        } finally {
            if (status !== 'success') {
                setLoading(false);
            }
        }
    };

    const resetForm = () => {
        setStatus('idle');
        setFile(null);
        setFirstName('');
        setLastName('');
        setEmail('');
        setMessage('');
        setLoading(false);
    };

    return (
        <section
            className="relative py-24 px-4 min-h-[90vh] flex items-center justify-center overflow-hidden bg-white"
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-blue-50 rounded-full opacity-50 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-indigo-50 rounded-full opacity-50 blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-4xl w-full">
                <div className="text-center mb-12">
                    <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                        {t.joinNetwork}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                        {t.title}
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        {t.subtitle}
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
                    <div className="p-8 md:p-12">
                        {status === 'success' ? (
                            <div className="text-center py-16 animate-in fade-in zoom-in duration-300">
                                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                    <CheckCircle className="w-12 h-12 text-green-600" />
                                </div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-4">{t.successTitle}</h2>
                                <p className="text-slate-600 mb-10 max-w-md mx-auto text-lg">{t.successMessage}</p>
                                <button
                                    onClick={resetForm}
                                    className="px-8 py-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl font-medium flex items-center justify-center gap-2 mx-auto"
                                >
                                    <Upload className="w-5 h-5" />
                                    {t.uploadAnother}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* First Name Input */}
                                    <div className="space-y-2">
                                        <label htmlFor="firstName" dir={isRTL ? 'rtl' : 'ltr'} className={`block text-sm font-semibold text-slate-700 `}>
                                            {t.firstNameLabel}
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                            className={`w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 font-medium ${isRTL ? 'text-right' : 'text-left'}`}
                                            placeholder={currentLanguage === 'ar' ? 'الاسم الأول' : 'John'}
                                            dir={isRTL ? 'rtl' : 'ltr'}
                                        />
                                    </div>

                                    {/* Last Name Input */}
                                    <div className="space-y-2">
                                        <label htmlFor="lastName" dir={isRTL ? 'rtl' : 'ltr'} className={`block text-sm font-semibold text-slate-700 `}>
                                            {t.lastNameLabel}
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            required
                                            className={`w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 font-medium ${isRTL ? 'text-right' : 'text-left'}`}
                                            placeholder={currentLanguage === 'ar' ? 'الاسم الأخير' : 'Doe'}
                                            dir={isRTL ? 'rtl' : 'ltr'}
                                        />
                                    </div>
                                </div>

                                {/* Email Input - Full Width */}
                                <div className="space-y-2">
                                    <label htmlFor="email" dir={isRTL ? 'rtl' : 'ltr'} className={`block text-sm font-semibold text-slate-700 `}>
                                        {t.emailLabel}
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 font-medium text-left"
                                        placeholder="john@example.com"
                                        dir="ltr"
                                    />
                                </div>

                                {/* File Upload Area */}
                                <div className="space-y-3">
                                    <label className={`block text-sm font-semibold text-slate-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                                        CV / Resume
                                    </label>
                                    <div
                                        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer ${dragActive
                                            ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                                            : file
                                                ? 'border-green-500 bg-green-50 ring-2 ring-green-100'
                                                : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                                            }`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={() => !file && inputRef.current?.click()}
                                    >
                                        <input
                                            ref={inputRef}
                                            type="file"
                                            className="hidden"
                                            onChange={handleChange}
                                            accept=".pdf,.doc,.docx"
                                        />

                                        {file ? (
                                            <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                                                        <FileText className="w-6 h-6" />
                                                    </div>
                                                    <div className="text-start">
                                                        <p className="font-semibold text-slate-900 truncate max-w-[200px] md:max-w-xs">{file.name}</p>
                                                        <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setFile(null);
                                                    }}
                                                    className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                                                    title={t.removeFile}
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 pointer-events-none">
                                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto shadow-sm">
                                                    <Upload className="w-10 h-10 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xl font-semibold text-slate-900 mb-1">
                                                        {t.dragDrop}
                                                    </p>
                                                    <p className="text-slate-500 text-sm">{t.or}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium shadow-sm hover:bg-slate-50 transition-all pointer-events-auto"
                                                >
                                                    {t.browse}
                                                </button>
                                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                                                    {t.supportedFormats}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Error Message */}
                                {status === 'error' && (
                                    <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 animate-pulse">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <p className="text-sm font-medium">{message}</p>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="space-y-4">
                                    {loading && (
                                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading || !file || !firstName || !lastName || !email}
                                        className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${loading || !file || !firstName || !lastName || !email
                                            ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-xl hover:shadow-2xl'
                                            }`}
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-3">
                                                <span className="relative flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                                                </span>
                                                {t.submitting} {uploadProgress}%
                                            </span>
                                        ) : (
                                            t.submit
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DropCVSection;
