import React, { useState, useEffect } from 'react';
import { ServiceItem } from '../types';
import { ChevronRight, ChevronLeft, Sparkles, Tag, ArrowRight, Shield, Smartphone, Gamepad2, Briefcase } from 'lucide-react';

interface HeroCarouselProps {
  promotedServices: ServiceItem[];
  onSelectService: (service: ServiceItem) => void;
  t: (key: any) => string;
  lang: 'en' | 'fr' | 'ar';
  isAdmin?: boolean;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ 
  promotedServices, 
  onSelectService, 
  t, 
  lang,
  isAdmin,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Define the default "Brand" slide
  const defaultSlide = {
    id: 'default',
    type: 'brand',
    title: t('heroTitle'),
    subtitle: t('heroSubtitle'),
    desc: t('heroDesc'),
    colorClass: 'from-indigo-900 via-purple-900 to-slate-900',
    icon: Sparkles,
  };

  // Combine default slide with service slides
  const slides = [defaultSlide, ...promotedServices];
  const currentSlide = slides[currentIndex];
  const isService = 'price' in currentSlide; // Type guard check
  const Icon = isService ? getCategoryIcon((currentSlide as ServiceItem).category) : defaultSlide.icon;

  // Auto-play logic
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 8000); // 8 seconds per slide
    return () => clearInterval(interval);
  }, [slides.length, isPaused]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  function getCategoryIcon(category: string) {
    if (category.includes('Vault')) return Shield;
    if (category.includes('Telecom')) return Smartphone;
    if (category.includes('Gaming')) return Gamepad2;
    return Briefcase;
  };

  function getGradient(category: string) {
    if (category.includes('Vault')) return 'from-emerald-900 via-teal-900 to-slate-900';
    if (category.includes('Telecom')) return 'from-blue-900 via-indigo-900 to-slate-900';
    if (category.includes('Gaming')) return 'from-purple-900 via-fuchsia-900 to-slate-900';
    return 'from-slate-800 via-slate-900 to-black';
  };

  return (
    <div 
      className="relative overflow-hidden rounded-2xl shadow-2xl group h-[400px] sm:h-[450px] transition-all duration-500 bg-slate-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background: Gradient */}
      <div className="absolute inset-0 w-full h-full">
          <div 
            className={`absolute inset-0 bg-gradient-to-r transition-colors duration-1000 ease-in-out ${
                isService ? getGradient((currentSlide as ServiceItem).category) : defaultSlide.colorClass
            }`}
          >
             {/* Fallback Abstract Shapes */}
             <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/5 blur-3xl animate-pulse"></div>
             <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-white/5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
          </div>
        {/* Dark Overlay for Text Readability */}
        <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-12">
        <div className={`max-w-2xl transition-all duration-500 transform ${isPaused ? 'scale-[1.01]' : 'scale-100'}`}>
            
            {/* Header / Badge */}
            <div className="flex items-center gap-2 mb-4 animate-in slide-in-from-bottom-2 fade-in duration-700">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md border ${isService ? 'bg-white/10 text-white border-white/20' : 'bg-indigo-500/20 text-indigo-100 border-indigo-500/30'}`}>
                    <Icon className="h-4 w-4" />
                    {isService ? (currentSlide as ServiceItem).badgeLabel || 'Featured Offer' : currentSlide.subtitle}
                </span>
                {isService && (currentSlide as ServiceItem).promoPrice && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/80 border border-rose-500/30 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider shadow-sm">
                        <Tag className="h-3 w-3" /> Special Deal
                    </span>
                )}
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4 leading-tight drop-shadow-xl animate-in slide-in-from-bottom-3 fade-in duration-700 delay-100">
                {isService ? (currentSlide as ServiceItem).name : currentSlide.title}
            </h2>

            {/* Description */}
            <p className="text-lg text-slate-200 mb-8 leading-relaxed line-clamp-2 max-w-xl drop-shadow-md animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200">
                {isService ? (currentSlide as ServiceItem).description : currentSlide.desc}
            </p>

            {/* Pricing (If Service) */}
            {isService && (
                <div className="mb-8 flex items-baseline gap-3 animate-in slide-in-from-bottom-5 fade-in duration-700 delay-300">
                    <span className="text-4xl font-bold text-white drop-shadow-md">
                        {(currentSlide as ServiceItem).currency}
                        {((currentSlide as ServiceItem).promoPrice || (currentSlide as ServiceItem).price).toFixed(2)}
                    </span>
                    {(currentSlide as ServiceItem).promoPrice && (currentSlide as ServiceItem).promoPrice < (currentSlide as ServiceItem).price && (
                        <span className="text-xl text-slate-300 line-through decoration-slate-300/60 drop-shadow-sm">
                            {(currentSlide as ServiceItem).currency}{(currentSlide as ServiceItem).price.toFixed(2)}
                        </span>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 animate-in slide-in-from-bottom-6 fade-in duration-700 delay-400">
                <button 
                    onClick={() => isService ? onSelectService(currentSlide as ServiceItem) : document.getElementById('catalog-start')?.scrollIntoView({ behavior: 'smooth' })}
                    className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-slate-900 hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                    {isService ? t('startOrder') : t('browseCatalog')} 
                    <ArrowRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${lang === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                </button>
            </div>
        </div>
      </div>

      {/* Navigation Arrows (Only if multiple slides) */}
      {slides.length > 1 && (
          <>
            <button 
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white/50 backdrop-blur-sm hover:bg-black/40 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-20"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white/50 backdrop-blur-sm hover:bg-black/40 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-20"
            >
                <ChevronRight className="h-6 w-6" />
            </button>
          </>
      )}

      {/* Dots Indicators */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
        {slides.map((_, idx) => (
            <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
            />
        ))}
      </div>
    </div>
  );
};