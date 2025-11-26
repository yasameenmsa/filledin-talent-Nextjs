'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const HRTrendsSection = () => {
  const { currentLanguage } = useLanguage();

  // Helper function to get text based on current language
  const getText = (currentLanguage: string) => {
    const translations = {
      en: {
        hrTrendsTitle: 'HR Trends',
        hrTrend1: 'In 2025, HR Leaders must redefine their strategies and move beyond traditional leadership seminars to foster peer connections and embed learning opportunities into daily work, allowing managers to build stronger leadership skills and prepare for future demands. Through AI-powered personalized learning platforms, candidates and employees can access tailored training programs that align with both their unique needs and learning pace.',
        hrTrend2: 'While business Leaders plan to invest more in AI, HR organisations will redefine strategies to integrate into their HR processes. The most successful organizations will leverage AI for efficiency while empowering HR professionals to focus on what truly matters: People.',
        aiTalentTitle: 'AI & Talent Acquisition',
        aiTalent1: 'is working towards the clock to combine human expertise with AI-driven insights to ensure every candidate is the right fit for long-term success. We connect top talent with forward-thinking employers, blending human expertise, AI-driven insights, and a skills-first approach.',
        aiTalent2: 'FINT combined traditional recruitment and the new technology. The future of recruitment is not AI or Human, it is AI and Human. By strategically combining them, FINT creates a more efficient, data-informed, and fair process that allows talent and employees to connect and lead to great hires.',
        filledInTalent: 'FilledIn Talent'
      },
      fr: {
        hrTrendsTitle: 'Tendances RH',
        hrTrend1: 'En 2025, les dirigeants RH doivent redéfinir leurs stratégies et aller au-delà des séminaires de leadership traditionnels pour favoriser les connexions entre pairs et intégrer des opportunités d\'apprentissage dans le travail quotidien, permettant aux managers de développer des compétences de leadership plus solides et de se préparer aux demandes futures. Grâce aux plateformes d\'apprentissage personnalisées alimentées par l\'IA, les candidats et les employés peuvent accéder à des programmes de formation adaptés qui correspondent à leurs besoins uniques et à leur rythme d\'apprentissage.',
        hrTrend2: 'Alors que les dirigeants d\'entreprise prévoient d\'investir davantage dans l\'IA, les organisations RH redéfiniront leurs stratégies pour l\'intégrer dans leurs processus RH. Les organisations les plus performantes tireront parti de l\'IA pour l\'efficacité tout en permettant aux professionnels RH de se concentrer sur ce qui compte vraiment : les Personnes.',
        aiTalentTitle: 'IA et Acquisition de Talents',
        aiTalent1: 'travaille sans relâche pour combiner l\'expertise humaine avec des informations basées sur l\'IA afin de garantir que chaque candidat est le bon choix pour un succès à long terme. Nous connectons les meilleurs talents avec des employeurs avant-gardistes, en combinant l\'expertise humaine, les informations basées sur l\'IA et une approche axée sur les compétences.',
        aiTalent2: 'FINT a combiné le recrutement traditionnel et la nouvelle technologie. L\'avenir du recrutement n\'est pas IA ou Humain, c\'est IA et Humain. En les combinant stratégiquement, FINT crée un processus plus efficace, basé sur les données et équitable qui permet aux talents et aux employés de se connecter et de conduire à d\'excellents recrutements.',
        filledInTalent: 'FilledIn Talent'
      },
      ar: {
        hrTrendsTitle: 'اتجاهات الموارد البشرية',
        hrTrend1: 'في عام 2025، يجب على قادة الموارد البشرية إعادة تعريف استراتيجياتهم والتحرك إلى ما هو أبعد من ندوات القيادة التقليدية لتعزيز الروابط بين الأقران ودمج فرص التعلم في العمل اليومي، مما يسمح للمديرين ببناء مهارات قيادية أقوى والاستعداد للمتطلبات المستقبلية. من خلال منصات التعلم الشخصية المدعومة بالذكاء الاصطناعي، يمكن للمرشحين والموظفين الوصول إلى برامج تدريبية مصممة خصيصاً تتماشى مع احتياجاتهم الفريدة ووتيرة التعلم الخاصة بهم.',
        hrTrend2: 'بينما يخطط قادة الأعمال للاستثمار أكثر في الذكاء الاصطناعي، ستعيد مؤسسات الموارد البشرية تعريف استراتيجياتها للتكامل في عملياتها. ستستفيد المؤسسات الأكثر نجاحاً من الذكاء الاصطناعي لتحقيق الكفاءة مع تمكين محترفي الموارد البشرية من التركيز على ما يهم حقاً: الأشخاص.',
        aiTalentTitle: 'الذكاء الاصطناعي واكتساب المواهب',
        aiTalent1: 'تعمل على مدار الساعة للجمع بين الخبرة البشرية والرؤى المدفوعة بالذكاء الاصطناعي لضمان أن كل مرشح هو المناسب للنجاح على المدى الطويل. نحن نربط أفضل المواهب مع أصحاب العمل ذوي التفكير المستقبلي، من خلال مزج الخبرة البشرية والرؤى المدفوعة بالذكاء الاصطناعي ونهج يركز على المهارات.',
        aiTalent2: 'جمعت FINT بين التوظيف التقليدي والتكنولوجيا الجديدة. مستقبل التوظيف ليس الذكاء الاصطناعي أو الإنسان، بل هو الذكاء الاصطناعي والإنسان. من خلال الجمع بينهما بشكل استراتيجي، تخلق FINT عملية أكثر كفاءة ومستنيرة بالبيانات وعادلة تسمح للمواهب والموظفين بالتواصل وتؤدي إلى توظيفات رائعة.',
        filledInTalent: 'FilledIn Talent'
      }
    };
    return translations[currentLanguage as keyof typeof translations] || translations.en;
  };

  const text = getText(currentLanguage);

  return (
    <div
      className="py-16 px-4"
      style={{
        backgroundColor: '#f6f4ee',
      }}
      dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto max-w-7xl">
        {/* HR Trends Section */}
        <div className="mb-16">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Content */}
            <div className="flex-1">
              <h2 className="text-4xl font-bold mb-8" style={{ color: '#1e3a5f' }}>
                {text.hrTrendsTitle}
              </h2>

              <div className="space-y-6">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-black"></div>
                  </div>
                  <p className="text-gray-800 leading-relaxed text-base text-start">
                    {text.hrTrend1}
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-black"></div>
                  </div>
                  <p className="text-gray-800 leading-relaxed text-base text-start">
                    {text.hrTrend2}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="flex-shrink-0 lg:w-[450px]">
              <img
                src="https://res.cloudinary.com/dtpl6x0sk/image/upload/v1762016679/HRTrends1_whkqff.png"
                alt="HR Trends"
                className="w-full h-auto rounded-lg shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop';
                }}
              />
            </div>
          </div>
        </div>

        {/* AI & Talent Acquisition Section */}
        <div>
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Image */}
            <div className="flex-shrink-0 lg:w-[450px] order-2 lg:order-1">
              <img
                src="https://res.cloudinary.com/dtpl6x0sk/image/upload/v1762016677/HRTrends2_uetb60.png"
                alt="AI & Talent Acquisition"
                className="w-full h-auto rounded-lg shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop';
                }}
              />
            </div>

            {/* Right Content */}
            <div className="flex-1 order-1 lg:order-2">
              <h2 className="text-4xl font-bold mb-8" style={{ color: '#1e3a5f' }}>
                {text.aiTalentTitle}
              </h2>

              <div className="space-y-6">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-black"></div>
                  </div>
                  <p className="text-gray-800 leading-relaxed text-base text-start">
                    <span className="font-bold">{text.filledInTalent}</span> {text.aiTalent1}
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-black"></div>
                  </div>
                  <p className="text-gray-800 leading-relaxed text-base text-start">
                    {text.aiTalent2}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRTrendsSection;

