'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const STARMethodSection = () => {
  const { currentLanguage } = useLanguage();

  const getText = (lang: string) => {
    const translations = {
      en: {
        title: 'THE STAR METHOD',
        s: 'S',
        t: 'T',
        a: 'A',
        r: 'R',
        situation: 'Situation',
        situationDesc: 'Describe the context or challenge you faced',
        task: 'Task',
        taskDesc: 'Explain your specific responsibility in that scenario',
        action: 'Action',
        actionDesc: 'Detail the steps you took to address the situation',
        result: 'Result',
        resultDesc: 'Highlight the outcomes and achievements resulting from your efforts',
        exampleTitle: 'Example of competency-based questions - how to structure responses using the STAR method:',
        q1: 'Tell me about a time you successfully led a team',
        q1Situation: '"In my previous role as a project manager, we faced a tight deadline to deliver a critical client project within six weeks."',
        q1Task: '"My task was to lead a cross-functional team of six members, ensuring we stayed on track while maintaining high quality."',
        q1Action: '"I organize daily stand-up meetings to track progress, identify potential roadblocks early, and delegate tasks based on team members\' strengths. I also maintained open communication with the client to manage expectations."',
        q1Result: '"We completed the project two days ahead of schedule, and the client praised our efficiency and quality, leading to additional business opportunities for the company."',
        q2: 'Can you give an example of how you solved a difficult problem?',
        q2Situation: '"As a customer support representative, I once dealt with a frustrated customer whose order was delayed due to a system error."',
        q2Task: '"My task was to resolve the issue quickly while restoring the customer\'s trust in our service."',
        q2Action: '"I apologized sincerely and investigated the issue immediately. I expedited their order, provided a discount as a goodwill gesture, and kept the customer updated throughout the process."',
        q2Result: '"The customer was extremely satisfied with the resolution and left a positive review on our website, which improved our online reputation."',
        q3: 'Describe a time when you had to resolve a conflict at work',
        q3Situation: '"While working as a sales associate, two team members disagreed about how to prioritize customer service versus marketing tasks during a busy shift."',
        q3Task: '"As the team lead, I needed to mediate the conflict to maintain team harmony and ensure smooth operations during peak hours."',
        q3Action: '"I facilitated a quick discussion, allowing both team members to share their perspectives. Then, I proposed a compromise where one focused on customer service for the first half of the shift, while the other handled customer service, and they would switch roles midway."',
        q3Result: '"The compromise was well-received, and we exceeded our sales targets for the day. Both team members appreciated the resolution and worked together more collaboratively afterward."',
        followUs: 'Follow us',
        linkedIn: 'IN',
        instagram: 'Insta',
        youtube: 'Yt',
        footerName: 'FilledIn Talent',
        footerTagline: 'The Alternative Solution'
      },
      fr: {
        title: 'LA MÉTHODE STAR',
        s: 'S',
        t: 'T',
        a: 'A',
        r: 'R',
        situation: 'Situation',
        situationDesc: 'Décrivez le contexte ou le défi auquel vous avez été confronté',
        task: 'Tâche',
        taskDesc: 'Expliquez votre responsabilité spécifique dans ce scénario',
        action: 'Action',
        actionDesc: 'Détaillez les mesures que vous avez prises pour résoudre la situation',
        result: 'Résultat',
        resultDesc: 'Mettez en évidence les résultats et les réalisations découlant de vos efforts',
        exampleTitle: 'Exemple de questions basées sur les compétences - comment structurer les réponses en utilisant la méthode STAR :',
        q1: 'Parlez-moi d\'une fois où vous avez dirigé une équipe avec succès',
        q1Situation: '"Dans mon rôle précédent de chef de projet, nous avons fait face à un délai serré pour livrer un projet client critique en six semaines."',
        q1Task: '"Ma tâche était de diriger une équipe interfonctionnelle de six membres, en veillant à ce que nous restions sur la bonne voie tout en maintenant une haute qualité."',
        q1Action: '"J\'organise des réunions quotidiennes pour suivre les progrès, identifier les obstacles potentiels tôt et déléguer les tâches en fonction des forces des membres de l\'équipe. J\'ai également maintenu une communication ouverte avec le client pour gérer les attentes."',
        q1Result: '"Nous avons terminé le projet deux jours avant la date prévue, et le client a loué notre efficacité et notre qualité, ce qui a conduit à des opportunités commerciales supplémentaires pour l\'entreprise."',
        q2: 'Pouvez-vous donner un exemple de la façon dont vous avez résolu un problème difficile ?',
        q2Situation: '"En tant que représentant du service client, j\'ai traité avec un client frustré dont la commande avait été retardée en raison d\'une erreur système."',
        q2Task: '"Ma tâche était de résoudre le problème rapidement tout en restaurant la confiance du client dans notre service."',
        q2Action: '"Je me suis excusé sincèrement et j\'ai enquêté sur le problème immédiatement. J\'ai accéléré leur commande, fourni une réduction en geste de bonne volonté et tenu le client informé tout au long du processus."',
        q2Result: '"Le client était extrêmement satisfait de la résolution et a laissé un avis positif sur notre site Web, ce qui a amélioré notre réputation en ligne."',
        q3: 'Décrivez une situation où vous avez dû résoudre un conflit au travail',
        q3Situation: '"En travaillant comme associé aux ventes, deux membres de l\'équipe n\'étaient pas d\'accord sur la façon de prioriser le service client par rapport aux tâches de marketing pendant un quart de travail chargé."',
        q3Task: '"En tant que chef d\'équipe, j\'avais besoin de médiatiser le conflit pour maintenir l\'harmonie de l\'équipe et assurer des opérations fluides pendant les heures de pointe."',
        q3Action: '"J\'ai facilité une discussion rapide, permettant aux deux membres de l\'équipe de partager leurs perspectives. Ensuite, j\'ai proposé un compromis où l\'un se concentrait sur le service client pour la première moitié du quart de travail, tandis que l\'autre gérait le service client, et ils changeraient de rôles à mi-chemin."',
        q3Result: '"Le compromis a été bien accueilli et nous avons dépassé nos objectifs de vente pour la journée. Les deux membres de l\'équipe ont apprécié la résolution et ont travaillé ensemble de manière plus collaborative par la suite."',
        followUs: 'Suivez-nous',
        linkedIn: 'IN',
        instagram: 'Insta',
        youtube: 'Yt',
        footerName: 'FilledIn Talent',
        footerTagline: 'The Alternative Solution'
      },
      ar: {
        title: 'طريقة STAR',
        s: 'S',
        t: 'T',
        a: 'A',
        r: 'R',
        situation: 'الموقف',
        situationDesc: 'صف السياق أو التحدي الذي واجهته',
        task: 'المهمة',
        taskDesc: 'اشرح مسؤوليتك المحددة في ذلك السيناريو',
        action: 'الإجراء',
        actionDesc: 'فصّل الخطوات التي اتخذتها لمعالجة الموقف',
        result: 'النتيجة',
        resultDesc: 'سلط الضوء على النتائج والإنجازات الناتجة عن جهودك',
        exampleTitle: 'مثال على الأسئلة القائمة على الكفاءة - كيفية هيكلة الإجابات باستخدام طريقة STAR:',
        q1: 'أخبرني عن مرة قدت فيها فريقاً بنجاح',
        q1Situation: '"في دوري السابق كمدير مشروع، واجهنا موعداً نهائياً ضيقاً لتسليم مشروع عميل حرج في غضون ستة أسابيع."',
        q1Task: '"كانت مهمتي قيادة فريق متعدد الوظائف من ستة أعضاء، مع التأكد من أننا بقينا على المسار الصحيح مع الحفاظ على جودة عالية."',
        q1Action: '"نظمت اجتماعات يومية لتتبع التقدم، وتحديد العقبات المحتملة مبكراً، وتفويض المهام بناءً على نقاط قوة أعضاء الفريق. كما حافظت على التواصل المفتوح مع العميل لإدارة التوقعات."',
        q1Result: '"أكملنا المشروع قبل الموعد المحدد بيومين، وأشاد العميل بكفاءتنا وجودتنا، مما أدى إلى فرص عمل إضافية للشركة."',
        q2: 'هل يمكنك إعطاء مثال على كيفية حلك لمشكلة صعبة؟',
        q2Situation: '"كممثل دعم العملاء، تعاملت ذات مرة مع عميل محبط تأخر طلبه بسبب خطأ في النظام."',
        q2Task: '"كانت مهمتي حل المشكلة بسرعة مع استعادة ثقة العميل في خدمتنا."',
        q2Action: '"اعتذرت بصدق وحققت في المشكلة على الفور. قمت بتسريع طلبهم، وقدمت خصماً كإيماءة حسن نية، وأبقيت العميل على اطلاع طوال العملية."',
        q2Result: '"كان العميل راضياً للغاية عن الحل وترك تقييماً إيجابياً على موقعنا الإلكتروني، مما حسن سمعتنا على الإنترنت."',
        q3: 'صف وقتاً كان عليك فيه حل نزاع في العمل',
        q3Situation: '"أثناء العمل كمساعد مبيعات، اختلف اثنان من أعضاء الفريق حول كيفية تحديد أولويات خدمة العملاء مقابل مهام التسويق خلال فترة عمل مزدحمة."',
        q3Task: '"كقائد للفريق، كنت بحاجة إلى التوسط في النزاع للحفاظ على انسجام الفريق وضمان العمليات السلسة خلال ساعات الذروة."',
        q3Action: '"يسّرت نقاشاً سريعاً، مما سمح لكلا عضوي الفريق بمشاركة وجهات نظرهما. ثم اقترحت حلاً وسطاً حيث يركز أحدهما على خدمة العملاء للنصف الأول من الفترة، بينما يتعامل الآخر مع خدمة العملاء، وسيتبادلان الأدوار في منتصف الطريق."',
        q3Result: '"تم استقبال الحل الوسط بشكل جيد، وتجاوزنا أهداف المبيعات لليوم. قدّر كلا عضوي الفريق الحل وعملا معاً بشكل أكثر تعاوناً بعد ذلك."',
        followUs: 'تابعنا',
        linkedIn: 'IN',
        instagram: 'Insta',
        youtube: 'Yt',
        footerName: 'FilledIn Talent',
        footerTagline: 'The Alternative Solution'
      }
    };
    return translations[lang as keyof typeof translations] || translations.en;
  };

  const text = getText(currentLanguage);

  return (
    <div
      className="py-12 px-4"
      style={{ backgroundColor: '#f6f4ee' }}
      dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto max-w-7xl">
        {/* STAR Method Title and Diagram */}
        <h2 className="text-4xl font-bold mb-8" style={{ color: '#000' }}>
          {text.title}
        </h2>

        {/* STAR Diagram */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between mb-12 gap-4">
          {/* S - Situation */}
          <div className="flex flex-col items-center flex-1">
            <div className="text-5xl lg:text-6xl font-bold mb-3" style={{ color: '#000' }}>{text.s}</div>
            <div
              className="w-full rounded-3xl p-5 lg:p-6"
              style={{
                backgroundColor: '#5b8fd6',
                minHeight: '160px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
              }}
            >
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-2 italic">{text.situation}</h3>
              <p className="text-white text-sm lg:text-base leading-relaxed">• {text.situationDesc}</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden lg:flex justify-center items-center px-2">
            <svg width="60" height="40" viewBox="0 0 60 40" style={{ opacity: 0.5 }}>
              <polygon points="0,15 40,15 40,0 60,20 40,40 40,25 0,25" fill="#a0a0a0" />
            </svg>
          </div>

          {/* T - Task */}
          <div className="flex flex-col items-center flex-1">
            <div className="text-5xl lg:text-6xl font-bold mb-3" style={{ color: '#000' }}>{text.t}</div>
            <div
              className="w-full rounded-3xl p-5 lg:p-6"
              style={{
                backgroundColor: '#5b8fd6',
                minHeight: '160px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
              }}
            >
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-2 italic">{text.task}</h3>
              <p className="text-white text-sm lg:text-base leading-relaxed">• {text.taskDesc}</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden lg:flex justify-center items-center px-2">
            <svg width="60" height="40" viewBox="0 0 60 40" style={{ opacity: 0.5 }}>
              <polygon points="0,15 40,15 40,0 60,20 40,40 40,25 0,25" fill="#a0a0a0" />
            </svg>
          </div>

          {/* A - Action */}
          <div className="flex flex-col items-center flex-1">
            <div className="text-5xl lg:text-6xl font-bold mb-3" style={{ color: '#000' }}>{text.a}</div>
            <div
              className="w-full rounded-3xl p-5 lg:p-6"
              style={{
                backgroundColor: '#5b8fd6',
                minHeight: '160px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
              }}
            >
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-2 italic">{text.action}</h3>
              <p className="text-white text-sm lg:text-base leading-relaxed">• {text.actionDesc}</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden lg:flex justify-center items-center px-2">
            <svg width="60" height="40" viewBox="0 0 60 40" style={{ opacity: 0.5 }}>
              <polygon points="0,15 40,15 40,0 60,20 40,40 40,25 0,25" fill="#a0a0a0" />
            </svg>
          </div>

          {/* R - Result */}
          <div className="flex flex-col items-center flex-1">
            <div className="text-5xl lg:text-6xl font-bold mb-3" style={{ color: '#000' }}>{text.r}</div>
            <div
              className="w-full rounded-3xl p-5 lg:p-6"
              style={{
                backgroundColor: '#5b8fd6',
                minHeight: '160px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
              }}
            >
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-2 italic">{text.result}</h3>
              <p className="text-white text-sm lg:text-base leading-relaxed">• {text.resultDesc}</p>
            </div>
          </div>
        </div>



        {/* STAR Diagram */}
        <div className="flex items-center justify-between mb-12 gap-4">
          {/* S - Situation */}
          <div className="flex flex-col items-center flex-1">
            <div className="text-6xl font-bold mb-2" style={{ color: '#000' }}>{text.s}</div>
            <div
              className="w-full rounded-2xl p-6 shadow-lg"
              style={{
                backgroundColor: '#5b8fd6',
                minHeight: '180px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <h3 className="text-2xl font-bold text-white mb-3 italic">{text.situation}</h3>
              <p className="text-white text-base leading-relaxed">• {text.situationDesc}</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="text-6xl" style={{ color: '#a0a0a0' }}>➤</div>

          {/* T - Task */}
          <div className="flex flex-col items-center flex-1">
            <div className="text-6xl font-bold mb-2" style={{ color: '#000' }}>{text.t}</div>
            <div
              className="w-full rounded-2xl p-6 shadow-lg"
              style={{
                backgroundColor: '#5b8fd6',
                minHeight: '180px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <h3 className="text-2xl font-bold text-white mb-3 italic">{text.task}</h3>
              <p className="text-white text-base leading-relaxed">• {text.taskDesc}</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="text-6xl" style={{ color: '#a0a0a0' }}>➤</div>

          {/* A - Action */}
          <div className="flex flex-col items-center flex-1">
            <div className="text-6xl font-bold mb-2" style={{ color: '#000' }}>{text.a}</div>
            <div
              className="w-full rounded-2xl p-6 shadow-lg"
              style={{
                backgroundColor: '#5b8fd6',
                minHeight: '180px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <h3 className="text-2xl font-bold text-white mb-3 italic">{text.action}</h3>
              <p className="text-white text-base leading-relaxed">• {text.actionDesc}</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="text-6xl" style={{ color: '#a0a0a0' }}>➤</div>

          {/* R - Result */}
          <div className="flex flex-col items-center flex-1">
            <div className="text-6xl font-bold mb-2" style={{ color: '#000' }}>{text.r}</div>
            <div
              className="w-full rounded-2xl p-6 shadow-lg"
              style={{
                backgroundColor: '#5b8fd6',
                minHeight: '180px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <h3 className="text-2xl font-bold text-white mb-3 italic">{text.result}</h3>
              <p className="text-white text-base leading-relaxed">• {text.resultDesc}</p>
            </div>
          </div>
        </div>

        {/* Example Title */}
        <h3 className="text-2xl font-bold mb-8" style={{ color: '#000' }}>
          {text.exampleTitle}
        </h3>

        {/* Three Examples in Grid */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {/* Example 1 */}
          <div
            className="rounded-lg p-6 shadow-lg"
            style={{ backgroundColor: '#d4dce9' }}
          >
            <div
              className="rounded-lg p-4 mb-4 text-center"
              style={{ backgroundColor: '#5b8fd6' }}
            >
              <h4 className="text-xl font-bold text-white">{text.q1}</h4>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="font-bold mb-1" style={{ color: '#000' }}>• {text.situation}</p>
                <p style={{ color: '#333' }}>{text.q1Situation}</p>
              </div>
              <div>
                <p className="font-bold mb-1" style={{ color: '#000' }}>• {text.task}</p>
                <p style={{ color: '#333' }}>{text.q1Task}</p>
              </div>
              <div>
                <p className="font-bold mb-1" style={{ color: '#000' }}>• {text.action}</p>
                <p style={{ color: '#333' }}>{text.q1Action}</p>
              </div>
              <div>
                <p className="font-bold mb-1" style={{ color: '#000' }}>• {text.result}</p>
                <p style={{ color: '#333' }}>{text.q1Result}</p>
              </div>
            </div>
          </div>

          {/* Example 2 */}
          <div
            className="rounded-lg p-6 shadow-lg"
            style={{ backgroundColor: '#d4dce9' }}
          >
            <div
              className="rounded-lg p-4 mb-4 text-center"
              style={{ backgroundColor: '#5b8fd6' }}
            >
              <h4 className="text-xl font-bold text-white">{text.q2}</h4>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="font-bold mb-1" style={{ color: '#000' }}>• {text.situation}</p>
                <p style={{ color: '#333' }}>{text.q2Situation}</p>
              </div>
              <div>
                <p className="font-bold mb-1" style={{ color: '#000' }}>• {text.task}</p>
                <p style={{ color: '#333' }}>{text.q2Task}</p>
              </div>
              <div>
                <p className="font-bold mb-1" style={{ color: '#000' }}>• {text.action}</p>
                <p style={{ color: '#333' }}>{text.q2Action}</p>
              </div>
              <div>
                <p className="font-bold mb-1" style={{ color: '#000' }}>• {text.result}</p>
                <p style={{ color: '#333' }}>{text.q2Result}</p>
              </div>
            </div>
          </div>

          {/* Example 3 */}
          <div
            className="rounded-lg p-6 shadow-lg"
            style={{ backgroundColor: '#d4dce9' }}
          >
            <div
              className="rounded-lg p-4 mb-4 text-center"
              style={{ backgroundColor: '#5b8fd6' }}
            >
              <h4 className="text-xl font-bold text-white">{text.q3}</h4>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="font-bold mb-1" style={{ color: '#000' }}>• {text.situation}</p>
                <p style={{ color: '#333' }}>{text.q3Situation}</p>
              </div>
              <div>
                <p className="font-bold mb-1" style={{ color: '#000' }}>• {text.task}</p>
                <p style={{ color: '#333' }}>{text.q3Task}</p>
              </div>
              <div>
                <p className="font-bold mb-1" style={{ color: '#000' }}>• {text.action}</p>
                <p style={{ color: '#333' }}>{text.q3Action}</p>
              </div>
              <div>
                <p className="font-bold mb-1" style={{ color: '#000' }}>• {text.result}</p>
                <p style={{ color: '#333' }}>{text.q3Result}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-300">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10" style={{ color: '#1e3a5f' }}>
              <svg viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="30" r="8" />
                <path d="M50 38 L50 70 M35 50 L65 50 M40 60 L60 60" stroke="currentColor" strokeWidth="6" fill="none" />
                <circle cx="35" cy="85" r="6" />
                <circle cx="65" cy="85" r="6" />
                <path d="M35 85 L35 70 M65 85 L65 70 M35 70 L65 70" stroke="currentColor" strokeWidth="4" fill="none" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-xl" style={{ color: '#6b8e23' }}>{text.footerName}</div>
              <div className="text-sm italic" style={{ color: '#4682b4' }}>{text.footerTagline}</div>
            </div>
          </div>

          {/* Social Media */}
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold" style={{ color: '#000' }}>{text.followUs}</span>
            <button className="text-2xl font-bold" style={{ color: '#000' }}>{text.linkedIn}</button>
            <button className="text-2xl font-bold" style={{ color: '#000' }}>{text.instagram}</button>
            <button className="text-2xl font-bold" style={{ color: '#000' }}>{text.youtube}</button>
          </div>
        </div>
      </div>
    </div>
  );
};



export default STARMethodSection