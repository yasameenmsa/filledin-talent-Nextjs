import React from 'react';

const JobSearchSection = ({ currentLanguage = 'en' }) => {
  // Helper function to get text based on current language
  const getText = (currentLanguage: string) => {
    const translations = {
      en: {
        title: 'Global Energy Talent Partner',
        heading: 'Ready for your next career move ?',
        keywords: 'Keywords, Job title',
        category: 'Category',
        workingType: 'Working type',
        location: 'Location',
        search: 'Search'
      },
      fr: {
        title: 'Partenaire Mondial des Talents Énergétiques',
        heading: 'Prêt pour votre prochaine carrière ?',
        keywords: 'Mots-clés, Titre du poste',
        category: 'Catégorie',
        workingType: 'Type de travail',
        location: 'Emplacement',
        search: 'Rechercher'
      },
      ar: {
        title: 'شريك المواهب العالمية للطاقة',
        heading: 'هل أنت مستعد لخطوتك المهنية التالية؟',

        keywords: 'الكلمات الرئيسية، المسمى الوظيفي',
        category: 'الفئة',
        workingType: 'نوع العمل',
        location: 'الموقع',
        search: 'بحث'
      }
    };
    return translations[currentLanguage as keyof typeof translations] || translations.en;
  };

  const text = getText(currentLanguage);

  return (
    <section 
      className="relative py-16 min-h-[400px] flex items-center"
      style={{
        backgroundImage: 'url(https://res.cloudinary.com/dtpl6x0sk/image/upload/v1759850669/s_1_f86nnk_wgfpmc.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Light overlay */}
      <div className="absolute inset-0 bg-white bg-opacity-60"></div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-3xl font-bold italic text-gray-900">
            {text.title}
          </h1>
        </div>

        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
            {text.heading}
          </h2>
          
          {/* Search Form - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 max-w-3xl mx-auto mb-8">
            <div className={currentLanguage === 'ar' ? "text-right" : "text-left"}>
              <label htmlFor="keywords" className="block text-sm font-semibold text-gray-900 mb-2">
                {text.keywords}
              </label>
              <input
                type="text"
                id="keywords"
                placeholder={text.keywords}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className={currentLanguage === 'ar' ? "text-right" : "text-left"}>
              <label htmlFor="category" className="block text-sm font-semibold text-gray-900 mb-2">
                {text.category}
              </label>
              <input
                type="text"
                id="category"
                placeholder={text.category}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className={currentLanguage === 'ar' ? "text-right" : "text-left"}>
              <label htmlFor="workingType" className="block text-sm font-semibold text-gray-900 mb-2">
                {text.workingType}
              </label>
              <input
                type="text"
                id="workingType"
                placeholder={text.workingType}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className={currentLanguage === 'ar' ? "text-right" : "text-left"}>
              <label htmlFor="location" className="block text-sm font-semibold text-gray-900 mb-2">
                {text.location}
              </label>
              <input
                type="text"
                id="location"
                placeholder={text.location}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button className="px-8 py-2 bg-gray-900 text-white font-semibold rounded hover:bg-gray-800 transition-colors">
            {text.search}
          </button>
        </div>
      </div>
    </section>
  );
};

export default JobSearchSection;