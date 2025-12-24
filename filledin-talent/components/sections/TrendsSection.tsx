'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

interface TrendItemProps {
  title: string;
  description: string;
  imagePlaceholder: string;
  isReversed?: boolean;
  currentLanguage: string;
}

const TrendItem: React.FC<TrendItemProps> = ({ title, description, imagePlaceholder, isReversed = false, currentLanguage }) => {
  const isRTL = currentLanguage === 'ar';

  return (
    <motion.div
      className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-16 mb-16 lg:mb-24 ${isReversed ? 'lg:flex-row-reverse' : ''}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      {/* Image */}
      <div className="w-full lg:w-1/2">
        <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-lg">
          <img
            src={imagePlaceholder}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Text Content */}
      <div className={`w-full lg:w-1/2 space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
        <h2 className="text-2xl lg:text-3xl font-bold text-blue-900 underline decoration-blue-900 decoration-2 underline-offset-4">
          {title}
        </h2>
        <p className="text-gray-700 text-base lg:text-lg leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

const TrendsSection: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const isRTL = currentLanguage === 'ar';

  // Helper function to get text based on current language
  const getText = (currentLanguage: string) => {
    const translations = {
      en: {
        hrTrendsTitle: 'HR Trends',
        hrTrendsDescription: 'In 2025, HR Leaders must redefine their strategies by developing managers, creating a strategic workforce planning, and optimising HR technology and data analytics. Moving beyond traditional leadership seminars to foster peer connections and embed learning opportunities into daily work allows managers to build stronger leadership skills and prepare for future demands.',
        aiTalentTitle: 'AI & Talent Acquisition',
        aiTalentDescription: 'Emerging solutions, such as generative AI, have the potential to transform HR operations by streamlining processes, enhancing decision-making, and improving the employee experience.',
        industryTrendsTitle: 'Industry Trends',
        industryTrendsDescription: 'FINT specialises in providing Global Talent in the Oil & Gas or Renewable energy sectors by connecting expertise from the reservoir to the refinery or from the source to the grid.',
        leverageKnowledgeText: 'Leverage your own knowledge with FilledIn Global trends:',
        leverageKnowledgeQuestion: '"what is happening in the energy sector and what are the new complex challenges?"'
      },
      fr: {
        hrTrendsTitle: 'Tendances RH',
        hrTrendsDescription: 'En 2025, les dirigeants RH doivent redéfinir leurs stratégies en développant les managers, en créant une planification stratégique de la main-d\'œuvre et en optimisant la technologie RH et l\'analyse des données. Aller au-delà des séminaires de leadership traditionnels pour favoriser les connexions entre pairs et intégrer les opportunités d\'apprentissage dans le travail quotidien permet aux managers de développer des compétences de leadership plus solides et de se préparer aux exigences futures.',
        aiTalentTitle: 'IA & Acquisition de Talents',
        aiTalentDescription: 'Les solutions émergentes, telles que l\'IA générative, ont le potentiel de transformer les opérations RH en rationalisant les processus, en améliorant la prise de décision et en améliorant l\'expérience des employés.',
        industryTrendsTitle: 'Tendances de l\'Industrie',
        industryTrendsDescription: 'FINT se spécialise dans la fourniture de talents mondiaux dans les secteurs du pétrole et du gaz ou des énergies renouvelables en connectant l\'expertise du réservoir à la raffinerie ou de la source au réseau.',
        leverageKnowledgeText: 'Tirez parti de vos propres connaissances avec les tendances mondiales FilledIn :',
        leverageKnowledgeQuestion: '"que se passe-t-il dans le secteur de l\'énergie et quels sont les nouveaux défis complexes ?"'
      },
      ar: {
        hrTrendsTitle: 'اتجاهات الموارد البشرية',
        hrTrendsDescription: 'في عام 2025، يجب على قادة الموارد البشرية إعادة تعريف استراتيجياتهم من خلال تطوير المديرين، وإنشاء تخطيط استراتيجي للقوى العاملة، وتحسين تكنولوجيا الموارد البشرية وتحليل البيانات. الانتقال من الندوات القيادية التقليدية إلى تعزيز الروابط بين الأقران ودمج فرص التعلم في العمل اليومي يسمح للمديرين ببناء مهارات قيادية أقوى والاستعداد للمتطلبات المستقبلية.',
        aiTalentTitle: 'الذكاء الاصطناعي واكتساب المواهب',
        aiTalentDescription: 'الحلول الناشئة، مثل الذكاء الاصطناعي التوليدي، لديها القدرة على تحويل عمليات الموارد البشرية من خلال تبسيط العمليات وتعزيز اتخاذ القرارات وتحسين تجربة الموظفين.',
        industryTrendsTitle: 'اتجاهات الصناعة',
        industryTrendsDescription: 'تختص FINT في توفير المواهب العالمية في قطاعات النفط والغاز أو الطاقة المتجددة من خلال ربط الخبرات من المكمن إلى المصفاة أو من المصدر إلى الشبكة.',
        leverageKnowledgeText: 'استفد من معرفتك الخاصة مع اتجاهات FilledIn العالمية:',
        leverageKnowledgeQuestion: '"ما الذي يحدث في قطاع الطاقة وما هي التحديات المعقدة الجديدة؟"'
      }
    };
    return translations[currentLanguage as keyof typeof translations] || translations.en;
  };

  const text = getText(currentLanguage);

  const trends = [
    {
      id: 'hr-trends',
      title: text.hrTrendsTitle,
      description: text.hrTrendsDescription,
      imagePlaceholder: '/images/home/HRTrends.jpg'
    },
    {
      id: 'ai-talent',
      title: text.aiTalentTitle,
      description: text.aiTalentDescription,
      imagePlaceholder: '/images/home/TalentAcquisition.jpg'
    },
    {
      id: 'industry-trends',
      title: text.industryTrendsTitle,
      description: text.industryTrendsDescription,
      imagePlaceholder: '/images/home/IndustryTrends.jpeg'
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-[#f6f4ee]" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        {trends.map((trend, index) => (
          <TrendItem
            key={trend.id}
            title={trend.title}
            description={trend.description}
            imagePlaceholder={trend.imagePlaceholder}
            isReversed={index % 2 === 1}
            currentLanguage={currentLanguage}
          />
        ))}

        {/* Leverage Knowledge Section */}
        <motion.div
          className={`mt-16 text-center ${isRTL ? 'rtl' : 'ltr'}`}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <p className="text-lg lg:text-xl text-gray-800 font-medium mb-2">
            {text.leverageKnowledgeText}
          </p>
          <p className="text-base lg:text-lg text-gray-600 italic">
            {text.leverageKnowledgeQuestion}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default TrendsSection;