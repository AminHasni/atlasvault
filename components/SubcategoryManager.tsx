import React, { useState, useMemo } from 'react';
import { Subcategory } from '../types';
import * as Icons from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';

interface SubcategoryManagerProps {
  subcategories: Subcategory[];
  onChange: (subcategories: Subcategory[]) => void;
  level?: number;
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

export const SubcategoryManager: React.FC<SubcategoryManagerProps> = ({ subcategories, onChange, level = 0 }) => {
  const [activeTab, setActiveTab] = useState<Tab>('en');
  const [newSub, setNewSub] = useState<Subcategory>({ id: '', label: '', label_fr: '', label_ar: '', desc: '', desc_fr: '', desc_ar: '', icon: 'Box', color: 'text-slate-500', fee: 0, subcategories: [] });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewSub(prev => ({ ...prev, [name]: name === 'fee' ? parseFloat(value) || 0 : value }));
  };

  const handleTranslate = async () => {
      if (!newSub.label && !newSub.desc) return;
      setIsTranslating(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const prompt = `Translate the following subcategory label and description into French and Arabic.
          Return ONLY a valid JSON object with the following keys: label_fr, label_ar, desc_fr, desc_ar.
          Label to translate: "${newSub.label}"
          Description to translate: "${newSub.desc}"`;

          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: {
                  responseMimeType: "application/json",
              }
          });

          const result = JSON.parse(response.text || '{}');
          setNewSub(prev => ({
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

  const handleAdd = () => {
    if (!newSub.label) return;
    
    if (editingIndex !== null) {
        const updated = [...subcategories];
        updated[editingIndex] = { ...updated[editingIndex], ...newSub, id: newSub.id || newSub.label.toUpperCase().replace(/\s+/g, '_') };
        onChange(updated);
        setEditingIndex(null);
    } else {
        const id = newSub.id || newSub.label.toUpperCase().replace(/\s+/g, '_');
        onChange([...subcategories, { ...newSub, id }]);
    }
    setNewSub({ id: '', label: '', label_fr: '', label_ar: '', desc: '', desc_fr: '', desc_ar: '', icon: 'Box', color: 'text-slate-500', fee: 0, subcategories: [] });
  };

  const handleEdit = (index: number) => {
      const sub = subcategories[index];
      setNewSub({
          id: sub.id,
          label: sub.label,
          label_fr: sub.label_fr,
          label_ar: sub.label_ar,
          desc: sub.desc || '',
          desc_fr: sub.desc_fr || '',
          desc_ar: sub.desc_ar || '',
          icon: sub.icon || 'Box',
          color: sub.color || 'text-slate-500',
          fee: sub.fee || 0,
          subcategories: sub.subcategories || []
      });
      setEditingIndex(index);
  };

  const handleCancelEdit = () => {
      setNewSub({ id: '', label: '', label_fr: '', label_ar: '', desc: '', desc_fr: '', desc_ar: '', icon: 'Box', color: 'text-slate-500', fee: 0, subcategories: [] });
      setEditingIndex(null);
  };

  const handleRemove = (index: number) => {
    onChange(subcategories.filter((_, i) => i !== index));
    if (editingIndex === index) handleCancelEdit();
  };

  const handleNestedChange = (index: number, newNested: Subcategory[]) => {
      const updated = [...subcategories];
      updated[index] = { ...updated[index], subcategories: newNested };
      onChange(updated);
  };

  return (
    <div className="space-y-6">
        {/* List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {subcategories.map((sub, idx) => {
              const SubIcon = (Icons as any)[sub.icon || 'Box'] || Icons.Box;
              const isExpanded = expandedIndex === idx;
              return (
              <motion.div 
                key={sub.id || idx}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`border rounded-2xl overflow-hidden transition-all ${level > 0 ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50' : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/80'}`}
              >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4 flex-1">
                       <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-sm ${sub.color?.replace('text-', 'bg-').replace('500', '500/10') || 'bg-slate-200 dark:bg-slate-700'}`}>
                           <SubIcon className={`h-6 w-6 ${sub.color || 'text-slate-500'}`} />
                       </div>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 flex-1">
                           <div className="sm:col-span-1">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">ID</span>
                             <span className="text-sm font-mono text-slate-600 dark:text-slate-300">{sub.id}</span>
                           </div>
                           <div className="sm:col-span-1">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Label (EN)</span>
                             <span className="text-sm font-bold text-slate-900 dark:text-white">{sub.label}</span>
                           </div>
                           <div className="sm:col-span-1">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Label (FR)</span>
                             <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{sub.label_fr || '-'}</span>
                           </div>
                           <div className="sm:col-span-1">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Fee</span>
                             <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{sub.fee}%</span>
                           </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                        <button
                          type="button"
                          onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${isExpanded ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                        >
                          <Icons.Layers className="h-3.5 w-3.5" />
                          {sub.subcategories?.length || 0}
                          {isExpanded ? <Icons.ChevronUp className="h-3.5 w-3.5" /> : <Icons.ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                        <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-3">
                          <button
                            type="button"
                            onClick={() => handleEdit(idx)}
                            className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Icons.Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(idx)}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Icons.Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                    </div>
                  </div>
                  
                  {/* Nested Subcategories */}
                  <AnimatePresence>
                    {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-slate-200 dark:border-slate-700 bg-slate-100/30 dark:bg-slate-900/30"
                        >
                            <div className="p-6">
                              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <Icons.CornerDownRight className="h-3.5 w-3.5" />
                                  Subcategories of {sub.label}
                              </h4>
                              <div className="pl-6 border-l-2 border-slate-200 dark:border-slate-700">
                                  <SubcategoryManager 
                                      subcategories={sub.subcategories || []} 
                                      onChange={(newNested) => handleNestedChange(idx, newNested)} 
                                      level={level + 1}
                                  />
                              </div>
                            </div>
                        </motion.div>
                    )}
                  </AnimatePresence>
              </motion.div>
            )})}
          </AnimatePresence>
          {subcategories.length === 0 && (
            <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
              <Icons.Inbox className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400 font-medium">No subcategories added yet.</p>
            </div>
          )}
        </div>

        {/* Add/Edit Form */}
        <div className={`p-6 rounded-2xl border-2 transition-all shadow-sm ${editingIndex !== null ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${editingIndex !== null ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {editingIndex !== null ? <Icons.Edit2 className="h-4 w-4" /> : <Icons.Plus className="h-4 w-4" />}
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingIndex !== null ? `Editing Subcategory: ${subcategories[editingIndex].label}` : 'Add New Subcategory'}
                </h4>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                {(['en', 'fr', 'ar'] as Tab[]).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
           </div>

           <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID (Auto-generated)</label>
                  <input 
                    type="text" 
                    name="id" 
                    value={newSub.id} 
                    onChange={handleInputChange}
                    placeholder="e.g. SUB_ID"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Label ({activeTab.toUpperCase()})
                    </label>
                    <button
                        type="button"
                        onClick={handleTranslate}
                        disabled={isTranslating || (!newSub.label && !newSub.desc)}
                        className="text-[10px] font-bold flex items-center gap-1 text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                    >
                        {isTranslating ? <Icons.Loader2 className="h-3 w-3 animate-spin" /> : <Icons.Languages className="h-3 w-3" />}
                        Auto Translate
                    </button>
                  </div>
                  <input 
                    type="text" 
                    name={activeTab === 'en' ? 'label' : `label_${activeTab}`} 
                    value={activeTab === 'en' ? newSub.label : (newSub as any)[`label_${activeTab}`]} 
                    onChange={handleInputChange}
                    placeholder={`Enter ${activeTab} label`}
                    dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Description ({activeTab.toUpperCase()})
                </label>
                <textarea 
                  name={activeTab === 'en' ? 'desc' : `desc_${activeTab}`} 
                  value={activeTab === 'en' ? newSub.desc : (newSub as any)[`desc_${activeTab}`]} 
                  onChange={handleInputChange}
                  rows={2}
                  placeholder={`Enter ${activeTab} description`}
                  dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Icon</label>
                    <select
                        name="icon"
                        value={newSub.icon}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                    >
                        {AVAILABLE_ICONS.map(icon => (
                            <option key={icon} value={icon}>{icon}</option>
                        ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Color</label>
                    <select
                        name="color"
                        value={newSub.color}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                    >
                        {AVAILABLE_COLORS.map(color => (
                            <option key={color} value={color}>{color.replace('text-', '').replace('-500', '')}</option>
                        ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Service Fee (%)</label>
                    <input
                        type="number"
                        name="fee"
                        value={newSub.fee}
                        onChange={handleInputChange}
                        min="0"
                        step="0.1"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                {editingIndex !== null && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                      Cancel
                    </button>
                )}
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!newSub.label}
                  className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${editingIndex !== null ? 'bg-emerald-600 shadow-emerald-500/20 hover:bg-emerald-500' : 'bg-indigo-600 shadow-indigo-500/20 hover:bg-indigo-500'}`}
                >
                  {editingIndex !== null ? <Icons.Check className="h-4 w-4" /> : <Icons.Plus className="h-4 w-4" />}
                  {editingIndex !== null ? 'Update Subcategory' : 'Add Subcategory'}
                </button>
              </div>
           </div>
        </div>
    </div>
  );
};
