import React from 'react';
import { motion } from 'motion/react';
import { Users, CheckCircle, Star, Clock } from 'lucide-react';

interface TrustSectionProps {
  lang: string;
}

export const TrustSection: React.FC<TrustSectionProps> = ({ lang }) => {
  const stats = [
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      value: '10k+',
      label: lang === 'fr' ? 'Clients Satisfaits' : lang === 'ar' ? 'عملاء راضون' : 'Happy Customers',
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-emerald-500" />,
      value: '50k+',
      label: lang === 'fr' ? 'Commandes Complétées' : lang === 'ar' ? 'طلبات مكتملة' : 'Orders Completed',
    },
    {
      icon: <Star className="h-8 w-8 text-amber-500" />,
      value: '4.9/5',
      label: lang === 'fr' ? 'Note Moyenne' : lang === 'ar' ? 'متوسط التقييم' : 'Average Rating',
    },
    {
      icon: <Clock className="h-8 w-8 text-indigo-500" />,
      value: '24/7',
      label: lang === 'fr' ? 'Support Client' : lang === 'ar' ? 'دعم العملاء' : 'Customer Support',
    }
  ];

  return (
    <div className="py-16 bg-slate-900 dark:bg-slate-950 rounded-3xl overflow-hidden relative my-12">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            {lang === 'fr' ? 'Pourquoi nous faire confiance ?' : lang === 'ar' ? 'لماذا تثق بنا؟' : 'Why Trust Us?'}
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            {lang === 'fr' 
              ? 'Des milliers de clients nous font confiance pour leurs besoins numériques.' 
              : lang === 'ar' 
              ? 'يثق بنا الآلاف من العملاء لتلبية احتياجاتهم الرقمية.' 
              : 'Thousands of customers trust us for their digital needs.'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 shadow-lg border border-slate-700">
                {stat.icon}
              </div>
              <div className="text-3xl font-black text-white mb-1 tracking-tight">{stat.value}</div>
              <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
