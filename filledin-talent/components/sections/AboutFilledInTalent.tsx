'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

const AboutFilledInTalent: React.FC = () => {
  const { currentLanguage } = useLanguage();

  const getText = (lang: string) => {
    const translations = {
      en: {
        title: 'About FilledIn Talent',
        p1: 'FilledIn Talent (FINT) is a specialized recruitment partner for the global energy sector. We provide expert talent solutions across the entire hydrocarbon lifecycle—from upstream exploration and downstream refining to crude trading—as well as the rapidly expanding renewable energy landscape.',
        p2: 'We speak the language of energy. Unlike generalist firms, we deliver candidates who are true specialists, with deep expertise in areas like FCC units, subsea manifolds, and trading arbitrage. This allows you to bypass lengthy explanations and focus on selecting the right fit.',
        p3: 'Our mission is to help companies in the Middle East and Africa build agile, future-ready workforces. We achieve this by combining our deep regional expertise in complex markets like Saudi Arabia, Nigeria, and the UAE with a modern, technology-driven approach.',
        p4: 'Our process leverages AI to enhance the efficiency of our expert human consultants, ensuring a proactive and precise match between exceptional candidates and transformative career opportunities.',
        p5: 'At our core, we believe recruitment should be strategic, transparent, and human-centered. FilledIn Talent is committed to global best practices in compliance, diversity, equity, and inclusion, building partnerships that power progress responsibly.',
        imageCaption: 'Arabic business women picture'
      },
      fr: {
        title: 'À propos de FilledIn Talent',
        p1: 'FilledIn Talent (FINT) est un partenaire de recrutement spécialisé pour le secteur énergétique mondial. Nous fournissons des solutions de talents expertes à travers l\'ensemble du cycle de vie des hydrocarbures—de l\'exploration en amont et du raffinage en aval au négoce de pétrole brut—ainsi que dans le paysage en expansion rapide des énergies renouvelables.',
        p2: 'Nous parlons le langage de l\'énergie. Contrairement aux entreprises généralistes, nous fournissons des candidats qui sont de véritables spécialistes, avec une expertise approfondie dans des domaines tels que les unités FCC, les collecteurs sous-marins et l\'arbitrage commercial. Cela vous permet de contourner les longues explications et de vous concentrer sur la sélection du bon candidat.',
        p3: 'Notre mission est d\'aider les entreprises du Moyen-Orient et d\'Afrique à constituer des effectifs agiles et prêts pour l\'avenir. Nous y parvenons en combinant notre profonde expertise régionale dans des marchés complexes comme l\'Arabie saoudite, le Nigeria et les EAU avec une approche moderne axée sur la technologie.',
        p4: 'Notre processus exploite l\'IA pour améliorer l\'efficacité de nos consultants humains experts, garantissant une correspondance proactive et précise entre des candidats exceptionnels et des opportunités de carrière transformatrices.',
        p5: 'À la base, nous croyons que le recrutement devrait être stratégique, transparent et centré sur l\'humain. FilledIn Talent s\'engage à respecter les meilleures pratiques mondiales en matière de conformité, de diversité, d\'équité et d\'inclusion, en établissant des partenariats qui alimentent le progrès de manière responsable.',
        imageCaption: 'Photo de femmes d\'affaires arabes'
      },
      ar: {
        title: 'عن FilledIn Talent',
        p1: 'FilledIn Talent (FINT) هي شريك توظيف متخصص لقطاع الطاقة العالمي. نحن نقدم حلول المواهب الخبيرة عبر دورة حياة الهيدروكربون بأكملها - من الاستكشاف في المنبع والتكرير في المصب إلى تجارة النفط الخام - بالإضافة إلى مشهد الطاقة المتجددة الذي يتوسع بسرعة.',
        p2: 'نحن نتحدث لغة الطاقة. على عكس الشركات العامة، نقدم مرشحين هم متخصصون حقيقيون، مع خبرة عميقة في مجالات مثل وحدات FCC، والمشعبات تحت البحر، والمراجحة التجارية. هذا يسمح لك بتجاوز التفسيرات المطولة والتركيز على اختيار المناسب.',
        p3: 'مهمتنا هي مساعدة الشركات في الشرق الأوسط وأفريقيا على بناء قوى عاملة رشيقة وجاهزة للمستقبل. نحقق ذلك من خلال الجمع بين خبرتنا الإقليمية العميقة في الأسواق المعقدة مثل المملكة العربية السعودية ونيجيريا والإمارات العربية المتحدة مع نهج حديث يعتمد على التكنولوجيا.',
        p4: 'تستفيد عمليتنا من الذكاء الاصطناعي لتعزيز كفاءة استشاريينا البشريين الخبراء، مما يضمن مطابقة استباقية ودقيقة بين المرشحين الاستثنائيين وفرص العمل التحويلية.',
        p5: 'في جوهرنا، نؤمن أن التوظيف يجب أن يكون استراتيجياً وشفافاً ومتمحوراً حول الإنسان. FilledIn Talent ملتزمة بأفضل الممارسات العالمية في الامتثال والتنوع والمساواة والشمول، وبناء شراكات تدفع التقدم بمسؤولية.',
        imageCaption: 'صورة سيدات أعمال عربيات'
      }
    };
    return translations[lang as keyof typeof translations] || translations.en;
  };

  const text = getText(currentLanguage);
  const isRTL = currentLanguage === 'ar';

  return (
    <section
      className="py-16 px-4 md:px-6 lg:px-8"
      style={{ backgroundColor: '#f6f4ee' }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Left Content */}
          <div className="flex-1 space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight" style={{ color: '#000' }}>
              {text.title}
            </h2>

            <p className="text-base md:text-lg leading-relaxed" style={{ color: '#000' }}>
              {text.p1}
            </p>

            <p className="text-base md:text-lg leading-relaxed" style={{ color: '#000' }}>
              {text.p2}
            </p>

            <p className="text-base md:text-lg leading-relaxed" style={{ color: '#000' }}>
              {text.p3}
            </p>

            <p className="text-base md:text-lg leading-relaxed" style={{ color: '#000' }}>
              {text.p4}
            </p>

            <p className="text-base md:text-lg leading-relaxed" style={{ color: '#000' }}>
              {text.p5}
            </p>
          </div>

          {/* Right Image */}
          <div className="flex-shrink-0 w-full lg:w-[450px] xl:w-[500px]">
            <div className="relative w-full">
              <div
                className="w-full rounded-lg overflow-hidden shadow-lg relative"
                style={{
                  aspectRatio: '3/4',
                }}
              >
                <Image
                  src="/images/about/ArabWomen.jpeg"
                  alt={text.imageCaption}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutFilledInTalent;