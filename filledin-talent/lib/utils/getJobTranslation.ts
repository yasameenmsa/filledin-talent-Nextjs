import { IJob } from '@/models/Job';

/**
 * Helper function to extract job data in the requested language
 * Falls back to English if the requested language is not available
 * Falls back to default fields if no i18n data is available
 */
export function getJobTranslation(job: IJob, lang: string = 'en') {
    const supportedLangs = ['en', 'ar', 'fr'];
    const targetLang = supportedLangs.includes(lang) ? lang : 'en';

    // If no i18n data, return default fields
    if (!job.i18n) {
        return {
            title: job.title,
            description: job.description,
            responsibilities: job.responsibilities,
            requirements: {
                experience: job.requirements.experience,
                education: job.requirements.education,
                skills: job.requirements.skills,
                certifications: job.requirements.certifications,
                languages: job.requirements.languages,
            },
        };
    }

    // Try to get data in target language, fall back to English, then to defaults
    const i18nData = job.i18n[targetLang as 'en' | 'ar' | 'fr'] || job.i18n.en || {};

    return {
        title: i18nData.title || job.title,
        description: i18nData.description || job.description,
        responsibilities: i18nData.responsibilities || job.responsibilities,
        requirements: {
            experience: i18nData.requirements?.experience || job.requirements.experience,
            education: i18nData.requirements?.education || job.requirements.education,
            skills: job.requirements.skills, // Skills are not translated
            certifications: job.requirements.certifications,
            languages: job.requirements.languages,
        },
    };
}
