import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Zap, Clock, Headset } from 'lucide-react';

interface FeaturesSectionProps {
  lang: string;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ lang }) => {
  const features = [
    {
      icon: <Zap className="h-6 w-6 text-amber-500" />,
      title: lang === 'fr' ? 'Livraison Instantanée' : lang === 'ar' ? 'تسليم فوري' : 'Instant Delivery',
      desc: lang === 'fr' ? 'Recevez vos commandes en quelques secondes.' : lang === 'ar' ? 'احصل على طلباتك في ثوانٍ.' : 'Get your orders delivered in seconds.',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      border: 'border-amber-100 dark:border-amber-500/20'
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-emerald-500" />,
      title: lang === 'fr' ? 'Paiement Sécurisé' : lang === 'ar' ? 'دفع آمن' : 'Secure Payments',
      desc: lang === 'fr' ? 'Vos transactions sont 100% sécurisées.' : lang === 'ar' ? 'معاملاتك آمنة 100٪.' : 'Your transactions are 100% secure.',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      border: 'border-emerald-100 dark:border-emerald-500/20'
    },
    {
      icon: <Headset className="h-6 w-6 text-indigo-500" />,
      title: lang === 'fr' ? 'Support 24/7' : lang === 'ar' ? 'دعم 24/7' : '24/7 Support',
      desc: lang === 'fr' ? 'Notre équipe est toujours là pour vous aider.' : lang === 'ar' ? 'فريقنا دائما هنا لمساعدتك.' : 'Our team is always here to help you.',
      bg: 'bg-indigo-50 dark:bg-indigo-500/10',
      border: 'border-indigo-100 dark:border-indigo-500/20'
    },
    {
      icon: <Clock className="h-6 w-6 text-rose-500" />,
      title: lang === 'fr' ? 'Disponibilité 99.9%' : lang === 'ar' ? 'توفر 99.9٪' : '99.9% Uptime',
      desc: lang === 'fr' ? 'Des services fiables sur lesquels vous pouvez compter.' : lang === 'ar' ? 'خدمات موثوقة يمكنك الاعتماد عليها.' : 'Reliable services you can count on.',
      bg: 'bg-rose-50 dark:bg-rose-500/10',
      border: 'border-rose-100 dark:border-rose-500/20'
    }
  ];

  return (
    <div className="py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className={`p-6 rounded-3xl border ${feature.border} bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md transition-all group`}
          >
            <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              {feature.icon}
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
