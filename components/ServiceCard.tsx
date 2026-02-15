import React, { useMemo, useState, useEffect } from 'react';
import { ServiceItem } from '../types';
import { ArrowRight, Info, CheckCircle, XCircle, Star, Heart } from 'lucide-react';
import { getReviews } from '../services/storageService';

interface ServiceCardProps {
  service: ServiceItem;
  onClick: (service: ServiceItem) => void;
  isAdmin?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent, id: string) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick, isAdmin, isFavorite, onToggleFavorite }) => {
  const [ratingData, setRatingData] = useState({ average: 0, count: 0 });

  useEffect(() => {
    const fetchRating = async () => {
        try {
            const reviews = await getReviews(service.id);
            if (reviews.length > 0) {
                const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
                setRatingData({ average: sum / reviews.length, count: reviews.length });
            } else {
                setRatingData({ average: 0, count: 0 });
            }
        } catch (e) {
            console.error(e);
        }
    };
    fetchRating();
  }, [service.id]);

  return (
    <div 
      onClick={() => onClick(service)}
      className={`group relative overflow-hidden rounded-xl border p-6 
      transition-all duration-300 ease-out
      hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl 
      cursor-pointer 
      bg-white dark:bg-slate-800/50 
      border-slate-200 dark:border-slate-700
      hover:border-indigo-500/50 hover:dark:bg-slate-800 hover:bg-slate-50
      hover:shadow-indigo-500/20 
      ${!service.active && !isAdmin ? 'opacity-50 pointer-events-none grayscale' : ''}`}
    >
      <div className="absolute top-0 right-0 p-4 flex items-center gap-2">
         {!isAdmin && onToggleFavorite && (
             <button
               onClick={(e) => onToggleFavorite(e, service.id)}
               className="z-10 rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
             >
                <Heart className={`h-5 w-5 transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400 dark:text-slate-500'}`} />
             </button>
         )}
         <div className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
           <ArrowRight className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
         </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
         <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
            service.active 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:border-emerald-500/40' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400 group-hover:border-rose-500/40'
         }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${service.active ? 'bg-emerald-500 dark:bg-emerald-400 animate-pulse' : 'bg-rose-500 dark:bg-rose-400'}`} />
            {service.active ? 'Active' : 'Inactive'}
         </span>
      </div>

      <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
        {service.name}
      </h3>
      
      {/* Rating Display */}
      {ratingData.count > 0 && (
         <div className="mb-3 flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{ratingData.average.toFixed(1)}</span>
            <span className="text-xs text-slate-400">({ratingData.count})</span>
         </div>
      )}

      <p className="mb-6 line-clamp-2 text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
        {service.description}
      </p>

      <div className="flex items-end justify-between border-t border-slate-100 dark:border-slate-700 pt-4 group-hover:border-slate-200 dark:group-hover:border-slate-600 transition-colors">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider group-hover:text-indigo-600/70 dark:group-hover:text-indigo-300/70 transition-colors">Price</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {service.currency}{service.price.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg bg-slate-100 dark:bg-slate-700 p-2 text-slate-500 dark:text-slate-300 transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-500/30">
          <Info className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};
