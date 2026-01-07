'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const InterviewTipsSection = () => {
  const { currentLanguage } = useLanguage();

  const getText = (lang: string) => {
    const translations = {
      en: {
        title: 'Our best tips for smashing your next interview !',
        intro1: 'To master your interview , you must be prepared, execute and follow-up.',
        intro2: 'Approach it as a professional conversation not as an interrogation.',
        exampleTitle: 'Example of competency-based questions:',
        question1: '1- Tell me about time you successfully led a team?',
        question2: '2- Can you give an example of how you solved a difficult problem?',
        question3: '3- Describe a time when you had to resolve a conflict at work'
      },
      fr: {
        title: 'Nos meilleurs conseils pour réussir votre prochain entretien !',
        intro1: 'Pour maîtriser votre entretien, vous devez être préparé, exécuter et faire le suivi.',
        intro2: 'Abordez-le comme une conversation professionnelle et non comme un interrogatoire.',
        exampleTitle: 'Exemple de questions basées sur les compétences :',
        question1: '1- Parlez-moi d\'une fois où vous avez dirigé une équipe avec succès ?',
        question2: '2- Pouvez-vous donner un exemple de la façon dont vous avez résolu un problème difficile ?',
        question3: '3- Décrivez une situation où vous avez dû résoudre un conflit au travail'
      },
      ar: {
        title: 'أفضل نصائحنا للنجاح في مقابلتك القادمة!',
        intro1: 'لإتقان مقابلتك، يجب أن تكون مستعداً وتنفذ وتتابع.',
        intro2: 'تعامل معها كمحادثة مهنية وليس كاستجواب.',
        exampleTitle: 'أمثلة على الأسئلة القائمة على الكفاءة:',
        question1: '1- أخبرني عن مرة قدت فيها فريقاً بنجاح؟',
        question2: '2- هل يمكنك إعطاء مثال على كيفية حلك لمشكلة صعبة؟',
        question3: '3- صف وقتاً كان عليك فيه حل نزاع في العمل'
      }
    };
    return translations[lang as keyof typeof translations] || translations.en;
  };

  const text = getText(currentLanguage);

  return (
    <div
      className="py-16 px-4"
      style={{ backgroundColor: '#f6f4ee' }}
      dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left Content */}
          <div className="flex-1">
            <h2 className="text-4xl font-bold mb-8" style={{ color: '#000' }}>
              {text.title}
            </h2>

            <div className="space-y-4 mb-12 text-lg leading-relaxed" style={{ color: '#000' }}>
              <p>{text.intro1}</p>
              <p>{text.intro2}</p>
            </div>

            <h3 className="text-2xl font-bold mb-8" style={{ color: '#000' }}>
              {text.exampleTitle}
            </h3>

            <div className="space-y-6 text-lg leading-relaxed" style={{ color: '#000' }}>
              <p>{text.question1}</p>
              <p>{text.question2}</p>
              <p>{text.question3}</p>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex-shrink-0 lg:w-[500px]">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/home/Ourbesttips.jpeg"
                alt="Job Interview"
                className="w-full h-auto"
                style={{ aspectRatio: '500/600', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=900&fit=crop';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewTipsSection;