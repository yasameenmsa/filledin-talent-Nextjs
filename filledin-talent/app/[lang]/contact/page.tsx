'use client';

import { useState, use } from 'react';
import { Mail, Send, Loader2, CheckCircle2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = use(params);
    const language = lang === 'fr' ? 'fr' : lang === 'ar' ? 'ar' : 'en';

    const translations = {
        en: {
            title: 'Get In Touch',
            subtitle: 'We would love to hear from you. Send us a message and we will respond as soon as possible.',
            emailLabel: 'Email Address',
            messageLabel: 'Your Message',
            sendButton: 'Send Message',
            successMessage: 'Message sent successfully! We will get back to you soon.',
            errorMessage: 'Failed to send message. Please try again.',
            sending: 'Sending...',
            sendAnother: 'Send another message',
            emailPlaceholder: 'name@example.com'
        },
        fr: {
            title: 'Contactez-nous',
            subtitle: 'Nous aimerions avoir de vos nouvelles. Envoyez-nous un message et nous vous réponدرons dès que possible.',
            emailLabel: 'Adresse E-mail',
            messageLabel: 'Votre Message',
            sendButton: 'Envoyer le Message',
            successMessage: 'Message envoyé avec succès! Nous vous répondrons bientôt.',
            errorMessage: 'Échec de l\'envoi du message. Veuillez réessayer.',
            sending: 'Envoi en cours...',
            sendAnother: 'Envoyer un autre message',
            emailPlaceholder: 'nom@exemple.com'
        },
        ar: {
            title: 'تواصل معنا',
            subtitle: 'نود أن نسمع منك. أرسل لنا رسالة وسنرد عليك في أقرب وقت ممكن.',
            emailLabel: 'البريد الإلكتروني',
            messageLabel: 'رسالتك',
            sendButton: 'إرسال الرسالة',
            successMessage: 'تم إرسال الرسالة بنجاح! سنرد عليك قريبا.',
            errorMessage: 'فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.',
            sending: 'جاري الإرسال...',
            sendAnother: 'إرسال رسالة أخرى',
            emailPlaceholder: 'الاسم@مثال.com'
        }
    };

    const t = translations[language];
    const isRTL = language === 'ar';

    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, message }),
            });

            if (!response.ok) throw new Error('Failed to send');

            setStatus('success');
            setEmail('');
            setMessage('');
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <div className={`min-h-screen flex flex-col bg-gray-50 text-gray-900 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <Header />

            <main className="flex-grow container mx-auto px-4 py-16 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="md:flex">
                        {/* Contact Info Side */}
                        <div className="md:w-1/3 bg-[#3d5a80] p-8 text-white flex flex-col justify-between relative overflow-hidden">
                            {/* Pattern overlay */}
                            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                    <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                        <circle cx="2" cy="2" r="1" fill="currentColor" />
                                    </pattern>
                                    <rect width="100%" height="100%" fill="url(#dotPattern)" />
                                </svg>
                            </div>

                            <div className="relative z-10">
                                <h1 className="text-3xl font-bold mb-4">{t.title}</h1>
                                <p className="text-blue-100 mb-8 leading-relaxed">
                                    {t.subtitle}
                                </p>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white/10 p-2 rounded-lg">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <span>filledintalent@gmail.com</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 mt-12 md:mt-0">
                                {/* Decorative circle */}
                                <div className="w-24 h-24 bg-blue-400/20 rounded-full blur-xl absolute -bottom-10 -right-10"></div>
                            </div>
                        </div>

                        {/* Form Side */}
                        <div className="md:w-2/3 p-8 md:p-12">
                            {status === 'success' ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 animate-in fade-in duration-500">
                                    <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                                        <CheckCircle2 className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800">{t.successMessage}</h3>
                                    <button
                                        onClick={() => setStatus('idle')}
                                        className="mt-6 text-[#3d5a80] font-medium hover:underline focus:outline-none"
                                    >
                                        {t.sendAnother}
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            {t.emailLabel}
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3d5a80] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                            placeholder={t.emailPlaceholder}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                            {t.messageLabel}
                                        </label>
                                        <textarea
                                            id="message"
                                            required
                                            rows={5}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3d5a80] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white resize-none"
                                        ></textarea>
                                    </div>

                                    {status === 'error' && (
                                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                                            {t.errorMessage}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full bg-[#3d5a80] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#2c4260] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {status === 'loading' ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                {t.sending}
                                            </>
                                        ) : (
                                            <>
                                                <Send className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
                                                {t.sendButton}
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
