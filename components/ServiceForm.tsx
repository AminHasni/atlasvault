import React, { useState, useMemo } from 'react';
import { ServiceFormData, ServiceItem, Category } from '../types';
import { generateServiceDescription } from '../services/geminiService';
import { Sparkles, Loader2, Tag, Percent, Eye, Info, ArrowRight, Palette, Globe, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

interface ServiceFormProps {
  initialData?: ServiceItem;
  categories: Category[];
  onSubmit: (data: ServiceFormData) => void;
  onCancel: () => void;
}

type Tab = 'en' | 'fr' | 'ar';

export const ServiceForm: React.FC<ServiceFormProps> = ({ initialData, categories, onSubmit, onCancel }) => {
  const [activeTab, setActiveTab] = useState<Tab>('en');
  const [formData, setFormData] = useState<ServiceFormData>({
    name: initialData?.name || '',
    name_fr: initialData?.name_fr || '',
    name_ar: initialData?.name_ar || '',
    category: initialData?.category || (categories[0]?.id || ''),
    subcategory: initialData?.subcategory || '',
    second_subcategory_id: initialData?.second_subcategory_id || '',
    description: initialData?.description || '',
    description_fr: initialData?.description_fr || '',
    description_ar: initialData?.description_ar || '',
    price: initialData?.price || 0,
    promoPrice: initialData?.promoPrice ?? '',
    badgeLabel: initialData?.badgeLabel || '',
    currency: 'TND',
    conditions: initialData?.conditions || '',
    requiredInfo: initialData?.requiredInfo || '',
    active: initialData?.active ?? true,
    popularity: initialData?.popularity || 0,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const organizedSubcategories = useMemo(() => {
    const selectedCategory = categories.find(c => c.id === formData.category);
    if (!selectedCategory || !selectedCategory.subcategories) return [];

    const tree: { id: string; label: string; level: number; parentId?: string }[] = [];
    for (const sub of selectedCategory.subcategories) {
      tree.push({ id: sub.id, label: sub.label, level: 0 });
      if (sub.second_subcategories) {
        for (const secondSub of sub.second_subcategories) {
          tree.push({ id: secondSub.id, label: secondSub.label, level: 1, parentId: sub.id });
        }
      }
    }
    return tree;
  }, [categories, formData.category]);

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setFormData(prev => ({ ...prev, subcategory: '', second_subcategory_id: '' }));
      return;
    }
    const selected = organizedSubcategories.find(s => s.id === selectedId);
    if (selected) {
      if (selected.level === 0) {
        setFormData(prev => ({ ...prev, subcategory: selected.id, second_subcategory_id: '' }));
      } else {
        setFormData(prev => ({ ...prev, subcategory: selected.parentId || '', second_subcategory_id: selected.id }));
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'price' || name === 'promoPrice') 
        ? (value === '' ? '' : parseFloat(value)) 
        : value
    }));
  };

  const handleTranslate = async () => {
    if (!formData.name && !formData.description) return;
    setIsTranslating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Translate the following service name and description into French and Arabic.
      Return ONLY a valid JSON object with the following keys: name_fr, name_ar, description_fr, description_ar.
      Name to translate: "${formData.name}"
      Description to translate: "${formData.description}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      setFormData(prev => ({
        ...prev,
        name_fr: result.name_fr || prev.name_fr,
        name_ar: result.name_ar || prev.name_ar,
        description_fr: result.description_fr || prev.description_fr,
        description_ar: result.description_ar || prev.description_ar,
      }));
    } catch (error) {
      console.error("Translation failed", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) return;
    setIsGenerating(true);
    try {
      const notes = formData.description.length > 10 ? formData.description : "Premium quality, exclusive access, secure.";
      const generated = await generateServiceDescription(formData.name, formData.category as any, notes);
      setFormData(prev => ({ ...prev, description: generated }));
    } catch (e) {
      alert("Failed to generate description. Check API Key configuration.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      subcategory: formData.subcategory || null,
      second_subcategory_id: formData.second_subcategory_id || null,
      promoPrice: formData.promoPrice === '' ? null : Number(formData.promoPrice),
    };
    onSubmit(submissionData as any);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
      {/* Main Form Area */}
      <div className="flex-1 space-y-8">
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
            {(['en', 'fr', 'ar'] as Tab[]).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab === 'en' ? 'English' : tab === 'fr' ? 'Français' : 'العربية'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTranslate}
              disabled={isTranslating || (!formData.name && !formData.description)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition-all disabled:opacity-50"
            >
              {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
              Translate
            </button>
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={isGenerating || !formData.name}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 transition-all disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              AI Describe
            </button>
          </div>
        </div>

        {/* Content Section */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Name ({activeTab.toUpperCase()})</label>
              <input
                type="text"
                name={activeTab === 'en' ? 'name' : `name_${activeTab}`}
                value={activeTab === 'en' ? formData.name : (formData as any)[`name_${activeTab}`]}
                onChange={handleInputChange}
                placeholder={`Enter ${activeTab} service name`}
                dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
                className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3 text-sm font-medium outline-none focus:border-indigo-500 transition-all"
                required={activeTab === 'en'}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description ({activeTab.toUpperCase()})</label>
              <textarea
                name={activeTab === 'en' ? 'description' : `description_${activeTab}`}
                value={activeTab === 'en' ? formData.description : (formData as any)[`description_${activeTab}`]}
                onChange={handleInputChange}
                rows={4}
                placeholder={`Enter ${activeTab} description`}
                dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
                className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3 text-sm font-medium outline-none focus:border-indigo-500 transition-all resize-none"
                required={activeTab === 'en'}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Categorization Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
            <div className="relative">
              <Layers className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                name="category"
                value={formData.category}
                onChange={(e) => {
                    handleInputChange(e);
                    setFormData(prev => ({ ...prev, subcategory: '', second_subcategory_id: '' }));
                }}
                className="w-full rounded-2xl border-2 border-white dark:border-slate-800 bg-white dark:bg-slate-900 pl-12 pr-4 py-3 text-sm font-bold outline-none focus:border-indigo-500 transition-all appearance-none"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subcategory (Optional)</label>
            <select
              name="subcategory_selection"
              value={formData.second_subcategory_id || formData.subcategory || ''}
              onChange={handleSubcategoryChange}
              disabled={!formData.category}
              className="w-full rounded-2xl border-2 border-white dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500 transition-all appearance-none disabled:opacity-50"
            >
              <option value="">None</option>
              {organizedSubcategories.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {'\u00A0'.repeat(sub.level * 4)}{sub.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing & Details */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-emerald-500" />
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Pricing & Details</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Standard Price (TND)</label>
              <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Promo Price (Optional)</label>
              <input type="number" name="promoPrice" value={formData.promoPrice ?? ''} onChange={handleInputChange} className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Badge Label</label>
              <input type="text" name="badgeLabel" value={formData.badgeLabel || ''} onChange={handleInputChange} placeholder="e.g. HOT" className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500 transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conditions</label>
              <textarea name="conditions" value={formData.conditions} onChange={handleInputChange} rows={2} className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 transition-all resize-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Required Info</label>
              <textarea name="requiredInfo" value={formData.requiredInfo} onChange={handleInputChange} rows={2} className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 transition-all resize-none" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-slate-800">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={formData.active} onChange={() => setFormData(prev => ({ ...prev, active: !prev.active }))} />
              <div className={`block h-8 w-14 rounded-full transition-colors ${formData.active ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
              <div className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition-transform ${formData.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              {formData.active ? 'Active' : 'Inactive'}
            </span>
          </label>
          <div className="flex gap-4">
            <button type="button" onClick={onCancel} className="px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Cancel</button>
            <button type="submit" className="px-10 py-3 rounded-2xl text-sm font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 transition-all">
              Save Service
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview Sidebar */}
      <div className="w-full lg:w-80 space-y-6">
        <div className="sticky top-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-4 w-4 text-emerald-500" />
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Live Preview</h3>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Tag className="h-6 w-6" />
              </div>
              {formData.badgeLabel && (
                <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest">
                  {formData.badgeLabel}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-black text-slate-900 dark:text-white">
                {activeTab === 'en' ? formData.name : (formData as any)[`name_${activeTab}`] || 'Service Name'}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                {activeTab === 'en' ? formData.description : (formData as any)[`description_${activeTab}`] || 'Your service description will appear here...'}
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {formData.promoPrice || formData.price} TND
                  </span>
                  {formData.promoPrice && (
                    <span className="text-sm text-slate-400 line-through font-bold">
                      {formData.price} TND
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button type="button" className="w-full mt-6 py-4 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all">
              Order Now
            </button>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-500 shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed font-medium">
                This is how the service will appear to customers. Make sure the pricing and description are clear.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
