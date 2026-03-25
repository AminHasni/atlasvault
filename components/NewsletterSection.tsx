import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Send } from 'lucide-react';

interface NewsletterSectionProps {
  lang: string;
}

export const NewsletterSection: React.FC<NewsletterSectionProps> = ({ lang }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <div className="py-16 my-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
            {lang === 'fr' ? 'Restez Informé' : lang === 'ar' ? 'ابق على اطلاع' : 'Stay Updated'}
          </h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            {lang === 'fr' 
              ? 'Abonnez-vous à notre newsletter pour recevoir les dernières offres et mises à jour.' 
              : lang === 'ar' 
              ? 'اشترك في نشرتنا الإخبارية لتلقي أحدث العروض والتحديثات.' 
              : 'Subscribe to our newsletter to receive the latest offers and updates.'}
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto relative">
            <div className="relative flex items-center">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={lang === 'fr' ? 'Votre adresse email...' : lang === 'ar' ? 'عنوان بريدك الإلكتروني...' : 'Your email address...'}
                className="w-full pl-5 pr-14 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm transition-all"
                required
              />
              <button
                type="submit"
                className="absolute right-2 p-2.5 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors shadow-sm"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            {subscribed && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -bottom-8 left-0 w-full text-sm text-emerald-300 font-medium"
              >
                {lang === 'fr' ? 'Merci pour votre inscription !' : lang === 'ar' ? 'شكرا لاشتراكك!' : 'Thanks for subscribing!'}
              </motion.p>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
};
