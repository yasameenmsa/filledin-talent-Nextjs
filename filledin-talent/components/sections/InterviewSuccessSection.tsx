'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const InterviewSuccessSection = () => {
  const { currentLanguage } = useLanguage();
  
  const getText = (currentLanguage: string) => {
    const translations = {
      en: {
        title: 'How to succeed at interviews ?',
        intro: 'Succeeding in a job interview goes beyond simply showing up; it\'s about thorough preparation and showcasing your best self. Here\'s how to stand out:',
        tip1: 'Know the Company: Dive deep into the company\'s profile, culture, turnover, and short- and long-term strategies. Understanding what drives the organization helps you align your goals with theirs.',
        tip2: 'Reflect on the Role: Take time to analyze the job description and evaluate your personal motivation for the position. Why are you the perfect fit?',
        tip3: 'Prepare your "Stories" that demonstrate key competencies like "Leadership", "Problem solving".',
        tip4: 'Know your resume inside and out.',
        tip5: 'Prepare thoughtful questions to ask.',
        tip6: 'Master Proven Techniques: Prepare for competency-based questions using the STAR method—a trusted framework that helps you deliver clear and compelling answers.',
        conclusion: 'By combining company research, self-reflection, and structured answers using the STAR technique, you\'ll be ready to leave a lasting impression on your interviewer.',
        cta: 'Are you ready to take your preparation to the next level? Start today !'
      },
      fr: {
        title: 'Comment réussir vos entretiens ?',
        intro: 'Réussir un entretien d\'embauche va au-delà de simplement se présenter ; il s\'agit d\'une préparation approfondie et de montrer votre meilleur côté. Voici comment vous démarquer :',
        tip1: 'Connaître l\'Entreprise : Plongez profondément dans le profil de l\'entreprise, sa culture, son turnover et ses stratégies à court et long terme. Comprendre ce qui motive l\'organisation vous aide à aligner vos objectifs avec les leurs.',
        tip2: 'Réfléchir sur le Rôle : Prenez le temps d\'analyser la description du poste et d\'évaluer votre motivation personnelle pour le poste. Pourquoi êtes-vous le candidat parfait ?',
        tip3: 'Préparez vos "Histoires" qui démontrent des compétences clés comme "Leadership", "Résolution de problèmes".',
        tip4: 'Connaissez votre CV sur le bout des doigts.',
        tip5: 'Préparez des questions réfléchies à poser.',
        tip6: 'Maîtriser les Techniques Éprouvées : Préparez-vous aux questions basées sur les compétences en utilisant la méthode STAR - un cadre éprouvé qui vous aide à fournir des réponses claires et convaincantes.',
        conclusion: 'En combinant la recherche d\'entreprise, l\'auto-réflexion et des réponses structurées utilisant la technique STAR, vous serez prêt à laisser une impression durable sur votre intervieweur.',
        cta: 'Êtes-vous prêt à porter votre préparation au niveau supérieur ? Commencez aujourd\'hui !'
      },
      ar: {
        title: 'كيف تنجح في المقابلات؟',
        intro: 'النجاح في مقابلة العمل يتجاوز مجرد الحضور؛ يتعلق الأمر بالإعداد الشامل وإظهار أفضل ما لديك. إليك كيفية التميز:',
        tip1: 'اعرف الشركة: تعمق في ملف الشركة وثقافتها ومعدل دوران الموظفين واستراتيجياتها قصيرة وطويلة الأجل. فهم ما يحرك المؤسسة يساعدك على مواءمة أهدافك مع أهدافهم.',
        tip2: 'تأمل في الدور: خذ وقتاً لتحليل الوصف الوظيفي وتقييم دافعك الشخصي للمنصب. لماذا أنت المناسب تماماً؟',
        tip3: 'جهز "قصصك" التي تثبت الكفاءات الرئيسية مثل "القيادة" و"حل المشكلات".',
        tip4: 'اعرف سيرتك الذاتية من الداخل والخارج.',
        tip5: 'جهز أسئلة مدروسة لطرحها.',
        tip6: 'أتقن التقنيات المثبتة: استعد للأسئلة القائمة على الكفاءة باستخدام طريقة STAR - إطار موثوق يساعدك على تقديم إجابات واضحة ومقنعة.',
        conclusion: 'من خلال الجمع بين البحث عن الشركة والتأمل الذاتي والإجابات المنظمة باستخدام تقنية STAR، ستكون جاهزاً لترك انطباع دائم على القائم بالمقابلة.',
        cta: 'هل أنت مستعد لأخذ استعدادك إلى المستوى التالي؟ ابدأ اليوم!'
      }
    };
    return translations[currentLanguage as keyof typeof translations] || translations.en;
  };

  const text = getText(currentLanguage);

  return (
    <div 
      className="py-16 px-4"
      style={{ backgroundColor: '#f6f4ee' }}
      dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto max-w-7xl">
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-12 items-start mb-12">
          {/* Left Content */}
          <div className="flex-1">
            <h2 className="text-5xl font-bold mb-6" style={{ color: '#000' }}>
              {text.title}
            </h2>
            
            <p className="text-lg leading-relaxed mb-8" style={{ color: '#000' }}>
              {text.intro}
            </p>

            <ul className="space-y-6 text-base leading-relaxed" style={{ color: '#000' }}>
              <li className="flex gap-3">
                <span className="flex-shrink-0 mt-2">
                  <div className="w-2 h-2 rounded-full bg-black"></div>
                </span>
                <p>{text.tip1}</p>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 mt-2">
                  <div className="w-2 h-2 rounded-full bg-black"></div>
                </span>
                <p>{text.tip2}</p>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 mt-2">
                  <div className="w-2 h-2 rounded-full bg-black"></div>
                </span>
                <p>{text.tip3}</p>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 mt-2">
                  <div className="w-2 h-2 rounded-full bg-black"></div>
                </span>
                <p>{text.tip4}</p>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 mt-2">
                  <div className="w-2 h-2 rounded-full bg-black"></div>
                </span>
                <p>{text.tip5}</p>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 mt-2">
                  <div className="w-2 h-2 rounded-full bg-black"></div>
                </span>
                <p>{text.tip6}</p>
              </li>
            </ul>
          </div>

          {/* Right Image */}
          <div className="flex-shrink-0 lg:w-[500px]">
            <div 
              className="rounded-lg overflow-hidden shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, #e8e4dc 0%, #d4cfc4 100%)'
              }}
            >
              <img 
                src="https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=800&h=900&fit=crop"
                alt="Successful Interview"
                className="w-full h-auto"
                style={{ aspectRatio: '500/650', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=900&fit=crop';
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="text-center max-w-5xl mx-auto">
          <p className="text-lg leading-relaxed mb-6" style={{ color: '#000' }}>
            {text.conclusion}
          </p>
          
          <p className="text-xl font-bold" style={{ color: '#000' }}>
            {text.cta}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterviewSuccessSection;