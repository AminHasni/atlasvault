import React, { useState, useMemo } from 'react';
import { Category } from '../types';
import * as Icons from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';

interface CategoryFormProps {
  initialData?: Category;
  onSubmit: (data: Category) => void;
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

export const CategoryForm: React.FC<CategoryFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [activeTab, setActiveTab] = useState<Tab>('en');
  const [iconSearch, setIconSearch] = useState('');
  const [formData, setFormData] = useState<Category>({
    id: initialData?.id || '',
    label: initialData?.label || '',
    label_fr: initialData?.label_fr || '',
    label_ar: initialData?.label_ar || '',
    icon: initialData?.icon || 'Box',
    color: initialData?.color || 'text-slate-500',
    desc: initialData?.desc || '',
    desc_fr: initialData?.desc_fr || '',
    desc_ar: initialData?.desc_ar || '',
    order: initialData?.order || 0,
  });

  const [isTranslatingCat, setIsTranslatingCat] = useState(false);

  const isEditing = !!initialData;

  const filteredIcons = useMemo(() => {
    return AVAILABLE_ICONS.filter(icon => 
      icon.toLowerCase().includes(iconSearch.toLowerCase())
    );
  }, [iconSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) || 0 : value
    }));
  };

  const handleTranslateCategory = async () => {
      if (!formData.label && !formData.desc) return;
      setIsTranslatingCat(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const prompt = `Translate the following category label and description into French and Arabic.
          Return ONLY a valid JSON object with the following keys: label_fr, label_ar, desc_fr, desc_ar.
          Label to translate: "${formData.label}"
          Description to translate: "${formData.desc}"`;

          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: {
                  responseMimeType: "application/json",
              }
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
          setIsTranslatingCat(false);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) {
        // Auto-generate simple ID if missing and not editing
        formData.id = formData.label.toLowerCase().replace(/\s+/g, '-');
    }
    onSubmit({ ...formData, subcategories: initialData?.subcategories || [] });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header Info */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Icons.Settings2 className="h-5 w-5 text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Basic Configuration</h3>
          </div>
          
          {!isEditing && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">ID (Unique Identifier)</label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  placeholder="e.g. the-vault (Optional, auto-generated from label if empty)"
                />
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Icons.Info className="h-3 w-3" />
                  Used for database relationships. Cannot be changed later.
                </p>
              </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Display Order</label>
            <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>
        </div>

        {/* Multi-language Tabs */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            {(['en', 'fr', 'ar'] as Tab[]).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                {tab === 'en' ? 'English' : tab === 'fr' ? 'Français' : 'العربية'}
                {activeTab === tab && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 dark:bg-indigo-400" />
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            <div className="flex justify-end mb-4">
              <button
                  type="button"
                  onClick={handleTranslateCategory}
                  disabled={isTranslatingCat || (!formData.label && !formData.desc)}
                  className="text-xs font-bold flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all disabled:opacity-50"
              >
                  {isTranslatingCat ? <Icons.Loader2 className="h-3 w-3 animate-spin" /> : <Icons.Languages className="h-3 w-3" />}
                  Auto Translate All
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    {activeTab === 'en' ? 'Label (EN)' : activeTab === 'fr' ? 'Label (FR)' : 'Label (AR)'}
                  </label>
                  <input
                    type="text"
                    name={activeTab === 'en' ? 'label' : `label_${activeTab}`}
                    value={activeTab === 'en' ? formData.label : (formData as any)[`label_${activeTab}`]}
                    onChange={handleInputChange}
                    required={activeTab === 'en'}
                    dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    {activeTab === 'en' ? 'Description (EN)' : activeTab === 'fr' ? 'Description (FR)' : 'Description (AR)'}
                  </label>
                  <textarea
                    name={activeTab === 'en' ? 'desc' : `desc_${activeTab}`}
                    value={activeTab === 'en' ? formData.desc : (formData as any)[`desc_${activeTab}`]}
                    onChange={handleInputChange}
                    rows={4}
                    dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Visuals */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <Icons.Palette className="h-5 w-5 text-pink-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Visual Identity</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                Icon
                <div className="relative">
                  <Icons.Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search icons..." 
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    className="pl-7 pr-2 py-1 text-[10px] rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </label>
              <div className="grid grid-cols-5 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 h-48 overflow-y-auto custom-scrollbar">
                  {filteredIcons.map(iconName => {
                      const Icon = (Icons as any)[iconName];
                      return (
                          <button
                              key={iconName}
                              type="button"
                              onClick={() => setFormData({...formData, icon: iconName})}
                              className={`p-3 rounded-xl flex items-center justify-center transition-all ${formData.icon === iconName ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-110' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'}`}
                              title={iconName}
                          >
                              {Icon && <Icon className="h-5 w-5" />}
                          </button>
                      )
                  })}
                  {filteredIcons.length === 0 && (
                    <div className="col-span-5 py-8 text-center text-xs text-slate-500">No icons found</div>
                  )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Theme Color</label>
              <div className="grid grid-cols-3 gap-3">
                  {AVAILABLE_COLORS.map(colorClass => (
                      <button
                          key={colorClass}
                          type="button"
                          onClick={() => setFormData({...formData, color: colorClass})}
                          className={`h-12 rounded-xl border-2 transition-all flex items-center justify-center relative ${colorClass.replace('text-', 'bg-').replace('500', '500/10')} ${formData.color === colorClass ? 'border-indigo-500 scale-105 shadow-md' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'}`}
                      >
                          <div className={`h-4 w-4 rounded-full ${colorClass.replace('text-', 'bg-')} shadow-sm`}></div>
                          {formData.color === colorClass && (
                            <div className="absolute -top-1 -right-1 bg-indigo-500 text-white rounded-full p-0.5">
                              <Icons.Check className="h-2 w-2" />
                            </div>
                          )}
                      </button>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="group flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <Icons.X className="h-4 w-4 transition-transform group-hover:rotate-90" />
            Cancel
          </button>
          <button
            type="submit"
            className="group flex items-center gap-3 px-10 py-4 rounded-2xl bg-indigo-600 text-sm font-black uppercase tracking-widest text-white shadow-2xl shadow-indigo-500/40 hover:bg-indigo-500 hover:-translate-y-1 active:translate-y-0 transition-all"
          >
            {isEditing ? (
              <>
                <Icons.Save className="h-5 w-5" />
                Update Category
              </>
            ) : (
              <>
                <Icons.Plus className="h-5 w-5" />
                Create Category
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
