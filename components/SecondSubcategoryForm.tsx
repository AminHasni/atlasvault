import React, { useState, useMemo } from 'react';
import { SecondSubcategory, Subcategory, Category } from '../types';
import * as Icons from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';

interface SecondSubcategoryFormProps {
  initialData?: SecondSubcategory;
  categories: Category[];
  onSubmit: (data: SecondSubcategory) => void;
  onCancel: () => void;
}

type Tab = 'en' | 'fr' | 'ar';

const AVAILABLE_ICONS = [
  'Shield', 'Smartphone', 'Gamepad2', 'Briefcase', 'Zap', 'Globe', 'Server', 'Cloud', 'Lock', 'Wifi', 'Box', 'Layers', 'Tag', 'Star', 'Heart',
  'Monitor', 'Cpu', 'Database', 'Code', 'PenTool', 'Camera', 'Music', 'Video', 'Book', 'Coffee', 'Truck', 'ShoppingBag', 'Home', 'Tool', 'Activity', 'TrendingUp', 'Users', 'MessageSquare', 'Mail', 'Calendar', 'Car', 'Wrench', 'Scissors', 'Paintbrush', 'Palette', 'MapPin', 'Compass', 'Navigation', 'Plane', 'Bike'
];

const AVAILABLE_COLORS = [
  'text-emerald-500', 'text-blue-500', 'text-purple-500', 'text-slate-500', 
  'text-rose-500', 'text-amber-500', 'text-indigo-500', 'text-cyan-500', 'text-pink-500',
  'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-lime-500', 'text-green-500',
  'text-teal-500', 'text-sky-500', 'text-fuchsia-500', 'text-violet-500'
];

export const SecondSubcategoryForm: React.FC<SecondSubcategoryFormProps> = ({ initialData, categories, onSubmit, onCancel }) => {
  const [activeTab, setActiveTab] = useState<Tab>('en');
  
  // Flatten all subcategories from all categories
  const allSubcategories = useMemo(() => 
    categories.flatMap(cat => (cat.subcategories || []).map(sub => ({ ...sub, category_label: cat.label }))),
    [categories]
  );

  const [formData, setFormData] = useState<SecondSubcategory>({
    id: initialData?.id || '',
    subcategory_id: initialData?.subcategory_id || (allSubcategories.length > 0 ? allSubcategories[0].id : ''),
    label: initialData?.label || '',
    label_fr: initialData?.label_fr || '',
    label_ar: initialData?.label_ar || '',
    desc: initialData?.desc || '',
    desc_fr: initialData?.desc_fr || '',
    desc_ar: initialData?.desc_ar || '',
    icon: initialData?.icon || 'Box',
    color: initialData?.color || 'text-slate-500',
    fee: initialData?.fee || 0,
    order: initialData?.order || 0,
  });

  const [isTranslating, setIsTranslating] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const isEditing = !!initialData;

  const filteredIcons = useMemo(() => 
    AVAILABLE_ICONS.filter(icon => icon.toLowerCase().includes(iconSearch.toLowerCase())),
    [iconSearch]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fee' || name === 'order' ? parseFloat(value) || 0 : value
    }));
  };

  const handleTranslate = async () => {
      if (!formData.label && !formData.desc) return;
      setIsTranslating(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const prompt = `Translate the following Level 2 subcategory label and description into French and Arabic.
          Return ONLY a valid JSON object with the following keys: label_fr, label_ar, desc_fr, desc_ar.
          Label to translate: "${formData.label}"
          Description to translate: "${formData.desc}"`;

          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: { responseMimeType: "application/json" }
          });

          const result = JSON.parse(response.text || '{}');
          setFormData(prev => ({
              ...prev,
              label_fr: result.label_fr || prev.label_fr,
              label_ar: result.label_ar || prev.label_ar,
              desc_fr: result.desc_fr || prev.desc_fr,
              desc_ar: result.desc_ar || prev.desc_ar,
          }));
      } catch (error) {
          console.error("Translation failed", error);
      } finally {
          setIsTranslating(false);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subcategory_id) return;
    const dataToSubmit = {
        ...formData,
        id: formData.id || `SUB2_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    };
    onSubmit(dataToSubmit);
  };

  const ActiveIcon = (Icons as any)[formData.icon] || Icons.Box;

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
          <button
            type="button"
            onClick={handleTranslate}
            disabled={isTranslating || (!formData.label && !formData.desc)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition-all disabled:opacity-50"
          >
            {isTranslating ? <Icons.Loader2 className="h-4 w-4 animate-spin" /> : <Icons.Languages className="h-4 w-4" />}
            Auto-Translate All
          </button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Label ({activeTab.toUpperCase()})</label>
                <input
                  type="text"
                  name={activeTab === 'en' ? 'label' : `label_${activeTab}`}
                  value={activeTab === 'en' ? formData.label : (formData as any)[`label_${activeTab}`]}
                  onChange={handleInputChange}
                  placeholder={`Enter ${activeTab} label`}
                  dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
                  className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3 text-sm font-medium outline-none focus:border-indigo-500 transition-all"
                  required={activeTab === 'en'}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID / Slug</label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  disabled={isEditing}
                  placeholder="e.g. SUB2_ELECTRONICS"
                  className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-5 py-3 text-sm font-mono outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description ({activeTab.toUpperCase()})</label>
              <textarea
                name={activeTab === 'en' ? 'desc' : `desc_${activeTab}`}
                value={activeTab === 'en' ? formData.desc : (formData as any)[`desc_${activeTab}`]}
                onChange={handleInputChange}
                rows={3}
                placeholder={`Enter ${activeTab} description`}
                dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
                className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3 text-sm font-medium outline-none focus:border-indigo-500 transition-all resize-none"
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Hierarchy Section */}
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parent Subcategory (Level 1)</label>
            <select
              name="subcategory_id"
              value={formData.subcategory_id}
              onChange={handleInputChange}
              className="w-full rounded-2xl border-2 border-white dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500 transition-all appearance-none"
              required
            >
              {allSubcategories.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.category_label} → {sub.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Visuals Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Icons.Palette className="h-4 w-4 text-indigo-500" />
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Visual Identity</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="relative">
                <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search icons..."
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 pl-12 pr-4 py-3 text-sm outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="grid grid-cols-6 gap-2 h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 custom-scrollbar">
                {filteredIcons.map(iconName => {
                  const Icon = (Icons as any)[iconName] || Icons.Box;
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon: iconName }))}
                      className={`flex items-center justify-center p-3 rounded-xl transition-all ${formData.icon === iconName ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-110' : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50'}`}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Color</label>
              <div className="grid grid-cols-6 gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                {AVAILABLE_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`h-8 w-8 rounded-full transition-all flex items-center justify-center ${color.replace('text-', 'bg-')} ${formData.color === color ? 'ring-4 ring-white dark:ring-slate-700 scale-125 shadow-lg' : 'hover:scale-110'}`}
                  >
                    {formData.color === color && <Icons.Check className="h-4 w-4 text-white" />}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee (%)</label>
                  <input type="number" name="fee" value={formData.fee} onChange={handleInputChange} className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order</label>
                  <input type="number" name="order" value={formData.order} onChange={handleInputChange} className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500 transition-all" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
          <button type="button" onClick={onCancel} className="px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Cancel</button>
          <button type="submit" className="px-10 py-3 rounded-2xl text-sm font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 transition-all">
            {isEditing ? 'Update Level 2 Subcategory' : 'Create Level 2 Subcategory'}
          </button>
        </div>
      </div>

      {/* Live Preview Sidebar */}
      <div className="w-full lg:w-80 space-y-6">
        <div className="sticky top-6">
          <div className="flex items-center gap-2 mb-4">
            <Icons.Eye className="h-4 w-4 text-emerald-500" />
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Live Preview</h3>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
            <div className={`h-16 w-16 rounded-2xl mb-6 flex items-center justify-center shadow-lg ${formData.color.replace('text-', 'bg-').replace('500', '500/10')} ${formData.color}`}>
              <ActiveIcon className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-black text-slate-900 dark:text-white">
                {activeTab === 'en' ? formData.label : (formData as any)[`label_${activeTab}`] || 'Subcategory Label'}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {activeTab === 'en' ? formData.desc : (formData as any)[`desc_${activeTab}`] || 'Your subcategory description will appear here...'}
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Fee</span>
                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{formData.fee}%</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                <Icons.ArrowRight className="h-5 w-5 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
            <div className="flex gap-3">
              <Icons.Info className="h-5 w-5 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                Changes are reflected in real-time. Make sure to check all language tabs before saving.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
