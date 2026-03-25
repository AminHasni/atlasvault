import React, { useState, useMemo } from 'react';
import { ServiceFormData, ServiceItem, Category, ServiceOption, ServiceOptionValue } from '../types';
import { generateServiceDescription } from '../services/geminiService';
import { Sparkles, Loader2, Tag, Percent, Info, ArrowRight, Palette, Globe, Layers, Plus, Trash2, Settings2, CheckCircle2 } from 'lucide-react';
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
    options: initialData?.options || [],
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

  const addOption = () => {
    const newOption: ServiceOption = {
      id: `opt_${Date.now()}`,
      type: 'select',
      label: '',
      label_fr: '',
      label_ar: '',
      required: false,
      values: []
    };
    setFormData(prev => ({ ...prev, options: [...(prev.options || []), newOption] }));
  };

  const removeOption = (id: string) => {
    setFormData(prev => ({ ...prev, options: (prev.options || []).filter(o => o.id !== id) }));
  };

  const updateOption = (id: string, updates: Partial<ServiceOption>) => {
    setFormData(prev => ({
      ...prev,
      options: (prev.options || []).map(o => o.id === id ? { ...o, ...updates } : o)
    }));
  };

  const addOptionValue = (optionId: string) => {
    const newValue: ServiceOptionValue = {
      id: `val_${Date.now()}`,
      label: '',
      label_fr: '',
      label_ar: '',
      priceModifier: 0
    };
    setFormData(prev => ({
      ...prev,
      options: (prev.options || []).map(o => o.id === optionId ? { ...o, values: [...(o.values || []), newValue] } : o)
    }));
  };

  const removeOptionValue = (optionId: string, valueId: string) => {
    setFormData(prev => ({
      ...prev,
      options: (prev.options || []).map(o => o.id === optionId ? { ...o, values: (o.values || []).filter(v => v.id !== valueId) } : o)
    }));
  };

  const updateOptionValue = (optionId: string, valueId: string, updates: Partial<ServiceOptionValue>) => {
    setFormData(prev => ({
      ...prev,
      options: (prev.options || []).map(o => o.id === optionId ? {
        ...o,
        values: (o.values || []).map(v => v.id === valueId ? { ...v, ...updates } : v)
      } : o)
    }));
  };

  const handleTranslateOptions = async () => {
    if (!formData.options || formData.options.length === 0) return;
    setIsTranslating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Translate the following service options and their values into French and Arabic.
      Return ONLY a valid JSON object where keys are option IDs and values are objects with translated labels and values.
      Options to translate: ${JSON.stringify(formData.options.map(o => ({
        id: o.id,
        label: o.label,
        values: o.values?.map(v => ({ id: v.id, label: v.label }))
      })))}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      
      setFormData(prev => ({
        ...prev,
        options: (prev.options || []).map(o => {
          const trans = result[o.id];
          if (!trans) return o;
          
          return {
            ...o,
            label_fr: trans.label_fr || o.label_fr,
            label_ar: trans.label_ar || o.label_ar,
            values: (o.values || []).map(v => {
              const vTrans = trans.values?.find((vt: any) => vt.id === v.id);
              if (!vTrans) return v;
              return {
                ...v,
                label_fr: vTrans.label_fr || v.label_fr,
                label_ar: vTrans.label_ar || v.label_ar,
              };
            })
          };
        })
      }));
    } catch (error) {
      console.error("Options translation failed", error);
    } finally {
      setIsTranslating(false);
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
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      {/* Main Form Area */}
      <div className="space-y-8">
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

        {/* Customizable Options Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-indigo-500" />
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Service Plans & Options</h3>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleTranslateOptions}
                disabled={isTranslating || !formData.options?.length}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold hover:bg-indigo-100 transition-all disabled:opacity-50"
              >
                <Globe className="h-3 w-3" />
                Translate All
              </button>
              <button
                type="button"
                onClick={() => {
                  const newOption: ServiceOption = {
                    id: `opt_${Date.now()}`,
                    type: 'pricing-table',
                    label: 'Select Plan',
                    label_fr: 'Choisir un Plan',
                    label_ar: 'اختر الخطة',
                    required: true,
                    values: []
                  };
                  setFormData(prev => ({ ...prev, options: [...(prev.options || []), newOption] }));
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[10px] font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
              >
                <Plus className="h-3 w-3" />
                Add Pricing Plan
              </button>
              <button
                type="button"
                onClick={addOption}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                <Plus className="h-3 w-3" />
                Custom Option
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {formData.options?.map((option, optIdx) => (
              <div key={option.id} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Option Label ({activeTab.toUpperCase()})</label>
                      <input
                        type="text"
                        value={activeTab === 'en' ? option.label : (option as any)[`label_${activeTab}`]}
                        onChange={(e) => updateOption(option.id, { [activeTab === 'en' ? 'label' : `label_${activeTab}`]: e.target.value })}
                        className="w-full rounded-xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                        placeholder="e.g. Duration"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</label>
                      <select
                        value={option.type}
                        onChange={(e) => updateOption(option.id, { type: e.target.value as any })}
                        className="w-full rounded-xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 text-sm font-bold outline-none focus:border-indigo-500 transition-all appearance-none"
                      >
                        <option value="select">Selection (Dropdown)</option>
                        <option value="checkbox">Multi-choice (Checkboxes)</option>
                        <option value="text">Text Input</option>
                        <option value="pricing-table">Pricing Table</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-4 pt-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={option.required}
                          onChange={(e) => updateOption(option.id, { required: e.target.checked })}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Required</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeOption(option.id)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {option.type !== 'text' && (
                  <div className="pl-6 border-l-2 border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Values & Price Modifiers</label>
                      <button
                        type="button"
                        onClick={() => addOptionValue(option.id)}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        + Add Value
                      </button>
                    </div>
                    <div className="space-y-2">
                      {option.values?.map((val) => (
                        <div key={val.id} className="flex items-center gap-3">
                          <input
                            type="text"
                            value={activeTab === 'en' ? val.label : (val as any)[`label_${activeTab}`]}
                            onChange={(e) => updateOptionValue(option.id, val.id, { [activeTab === 'en' ? 'label' : `label_${activeTab}`]: e.target.value })}
                            className="flex-1 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium outline-none focus:border-indigo-500 transition-all"
                            placeholder="Value label"
                          />
                          <div className="flex items-center gap-2 w-32">
                            <span className="text-[10px] font-bold text-slate-400">+</span>
                            <input
                              type="number"
                              value={val.priceModifier}
                              onChange={(e) => updateOptionValue(option.id, val.id, { priceModifier: parseFloat(e.target.value) || 0 })}
                              className="w-full rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold outline-none focus:border-indigo-500 transition-all"
                              placeholder="0.00"
                            />
                            <span className="text-[10px] font-bold text-slate-400">TND</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeOptionValue(option.id, val.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {!formData.options?.length && (
              <div className="py-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                <p className="text-xs text-slate-400 font-medium italic">No customizable options added yet.</p>
              </div>
            )}
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
    </form>
  );
};
