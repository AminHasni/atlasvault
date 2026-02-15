import React, { useState } from 'react';
import { Review, User } from '../types';
import { addReview } from '../services/storageService';
import { Star, User as UserIcon, Send } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface ReviewSectionProps {
  serviceId: string;
  reviews: Review[];
  user: User | null;
  onReviewAdded: () => void;
  lang: 'en' | 'fr' | 'ar';
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ serviceId, reviews, user, onReviewAdded, lang }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const t = (key: keyof typeof TRANSLATIONS['en']) => {
    return TRANSLATIONS[lang][key] || key;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const newReview: Review = {
      id: crypto.randomUUID(),
      serviceId,
      userId: user.id,
      userName: user.name,
      rating,
      comment,
      createdAt: Date.now()
    };

    addReview(newReview);
    setComment('');
    setRating(5);
    onReviewAdded();
  };

  return (
    <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
        {t('reviews')} ({reviews.length})
      </h3>

      {user ? (
        <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{t('writeReview')}</h4>
          
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star 
                  className={`h-6 w-6 transition-colors ${
                    star <= (hoverRating || rating) 
                      ? 'fill-amber-400 text-amber-400' 
                      : 'text-slate-300 dark:text-slate-600'
                  }`} 
                />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('comment')}
            required
            rows={3}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 mb-3"
          />

          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 transition-colors"
          >
            <Send className="h-4 w-4" />
            {t('submitReview')}
          </button>
        </form>
      ) : (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-center">
           <p className="text-sm text-indigo-700 dark:text-indigo-300">{t('loginToReview')}</p>
        </div>
      )}

      <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 pb-4 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300">
                       <UserIcon className="h-4 w-4" />
                    </div>
                    <div>
                       <p className="text-sm font-semibold text-slate-900 dark:text-white">{review.userName}</p>
                       <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                             <Star 
                               key={i} 
                               className={`h-3 w-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} 
                             />
                          ))}
                       </div>
                    </div>
                 </div>
                 <span className="text-xs text-slate-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                 </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                 {review.comment}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">
             {t('noReviews')}
          </p>
        )}
      </div>
    </div>
  );
};