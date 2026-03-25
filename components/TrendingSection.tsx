import React from 'react';
import { motion } from 'motion/react';
import { Flame, ArrowRight } from 'lucide-react';
import { ServiceItem } from '../types';
import { ServiceCard } from './ServiceCard';

interface TrendingSectionProps {
  services: ServiceItem[];
  lang: string;
  t: (key: string) => string;
  onSelectService: (service: ServiceItem) => void;
  favorites: string[];
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  services,
  lang,
  t,
  onSelectService,
  favorites,
  onToggleFavorite
}) => {
  // Get top 8 most popular services
  const trendingServices = [...services]
    .filter(s => s.active)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 8);

  if (trendingServices.length === 0) return null;

  return (
    <div className="py-12 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
              <Flame className="h-6 w-6" />
            </div>
            {lang === 'fr' ? 'Les Plus Commandés' : lang === 'ar' ? 'الأكثر طلباً' : 'Most Ordered'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            {lang === 'fr' ? 'Découvrez nos services les plus populaires, basés sur les commandes.' : lang === 'ar' ? 'اكتشف خدماتنا الأكثر شعبية، بناءً على الطلبات.' : 'Discover our most popular services, based on actual orders.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {trendingServices.map((service, idx) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <ServiceCard
              service={service}
              onClick={() => onSelectService(service)}
              isFavorite={favorites.includes(service.id)}
              onToggleFavorite={(e) => {
                e.stopPropagation();
                onToggleFavorite(e, service.id);
              }}
              lang={lang as 'en' | 'fr' | 'ar'}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
