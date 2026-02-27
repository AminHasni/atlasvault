import React, { useState } from 'react';
import { Subcategory } from '../types';
import * as Icons from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface SubcategoryManagerProps {
  subcategories: Subcategory[];
  onChange: (subcategories: Subcategory[]) => void;
  level?: number;
}

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
    <div className="space-y-4">
        {/* List */}
        <div className="space-y-2">
          {subcategories.map((sub, idx) => {
            const SubIcon = (Icons as any)[sub.icon || 'Box'] || Icons.Box;
            const isExpanded = expandedIndex === idx;
            return (
            <div key={idx} className={`border rounded-lg ${level > 0 ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50' : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/80'}`}>
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3 w-full mr-4">
                     <div className={`h-10 w-10 rounded flex items-center justify-center ${sub.color?.replace('text-', 'bg-').replace('500', '500/20') || 'bg-slate-200 dark:bg-slate-700'}`}>
                         <SubIcon className={`h-5 w-5 ${sub.color || 'text-slate-500'}`} />
                     </div>
                     <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs w-full">
                         <div><span className="text-slate-500 block">ID</span>{sub.id}</div>
                         <div><span className="text-slate-500 block">EN</span>{sub.label}</div>
                         <div><span className="text-slate-500 block">FR</span>{sub.label_fr}</div>
                         <div><span className="text-slate-500 block">AR</span>{sub.label_ar}</div>
                         <div><span className="text-slate-500 block">Fee</span>{sub.fee}%</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                        className={`text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-1 flex items-center gap-1 text-xs font-medium bg-slate-200 dark:bg-slate-700 rounded px-2`}
                      >
                        <Icons.Layers className="h-3 w-3" />
                        {sub.subcategories?.length || 0} Subs
                        {isExpanded ? <Icons.ChevronUp className="h-3 w-3" /> : <Icons.ChevronDown className="h-3 w-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(idx)}
                        className="text-indigo-500 hover:text-indigo-600 p-1"
                      >
                        <Icons.Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="text-rose-500 hover:text-rose-600 p-1"
                      >
                        <Icons.Trash2 className="h-4 w-4" />
                      </button>
                  </div>
                </div>
                
                {/* Nested Subcategories */}
                {isExpanded && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-900/50 rounded-b-lg">
                        <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-2">
                            <Icons.CornerDownRight className="h-3 w-3" />
                            Subcategories of {sub.label}
                        </h4>
                        <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                            <SubcategoryManager 
                                subcategories={sub.subcategories || []} 
                                onChange={(newNested) => handleNestedChange(idx, newNested)} 
                                level={level + 1}
                            />
                        </div>
                    </div>
                )}
            </div>
          )})}
          {subcategories.length === 0 && (
            <p className="text-xs text-slate-500 italic">No subcategories added yet.</p>
          )}
        </div>

        {/* Add Form */}
        <div className={`grid grid-cols-1 sm:grid-cols-6 gap-2 items-end p-3 rounded-lg border transition-colors ${editingIndex !== null ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
           <div className="sm:col-span-1">
              <label className="text-xs text-slate-500 mb-1 block">ID (Auto)</label>
              <input 
                type="text" 
                name="id" 
                value={newSub.id} 
                onChange={handleInputChange}
                placeholder="Auto"
                className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs text-slate-900 dark:text-white"
              />
           </div>
           <div className="sm:col-span-1">
              <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-500 block">Label (EN)</label>
                  <button
                      type="button"
                      onClick={handleTranslate}
                      disabled={isTranslating || (!newSub.label && !newSub.desc)}
                      className="text-[10px] flex items-center gap-1 text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                  >
                      {isTranslating ? <Icons.Loader2 className="h-3 w-3 animate-spin" /> : <Icons.Languages className="h-3 w-3" />}
                      Auto
                  </button>
              </div>
              <input 
                type="text" 
                name="label" 
                value={newSub.label} 
                onChange={handleInputChange}
                placeholder="Name"
                className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs text-slate-900 dark:text-white"
              />
           </div>
           <div className="sm:col-span-1">
              <label className="text-xs text-slate-500 mb-1 block">Label (FR)</label>
              <input 
                type="text" 
                name="label_fr" 
                value={newSub.label_fr} 
                onChange={handleInputChange}
                placeholder="Nom"
                className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs text-slate-900 dark:text-white"
              />
           </div>
           <div className="sm:col-span-1">
              <label className="text-xs text-slate-500 mb-1 block">Label (AR)</label>
              <input 
                type="text" 
                name="label_ar" 
                value={newSub.label_ar} 
                onChange={handleInputChange}
                placeholder="الاسم"
                className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs text-slate-900 dark:text-white text-right"
              />
           </div>
           
           {/* Descriptions */}
           <div className="sm:col-span-2">
              <label className="text-xs text-slate-500 mb-1 block">Description (EN)</label>
              <textarea 
                name="desc" 
                value={newSub.desc} 
                onChange={handleInputChange}
                rows={2}
                className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs text-slate-900 dark:text-white"
              />
           </div>
           <div className="sm:col-span-2">
              <label className="text-xs text-slate-500 mb-1 block">Description (FR)</label>
              <textarea 
                name="desc_fr" 
                value={newSub.desc_fr} 
                onChange={handleInputChange}
                rows={2}
                className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs text-slate-900 dark:text-white"
              />
           </div>
           <div className="sm:col-span-2">
              <label className="text-xs text-slate-500 mb-1 block">Description (AR)</label>
              <textarea 
                name="desc_ar" 
                value={newSub.desc_ar} 
                onChange={handleInputChange}
                rows={2}
                className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs text-slate-900 dark:text-white text-right"
              />
           </div>

           <div className="sm:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
               <div className="space-y-1">
                  <label className="text-xs text-slate-500 block">Icon</label>
                  <select
                      name="icon"
                      value={newSub.icon}
                      onChange={handleInputChange}
                      className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                  >
                      {AVAILABLE_ICONS.map(icon => (
                          <option key={icon} value={icon}>{icon}</option>
                      ))}
                  </select>
               </div>
               <div className="space-y-1">
                  <label className="text-xs text-slate-500 block">Color</label>
                  <select
                      name="color"
                      value={newSub.color}
                      onChange={handleInputChange}
                      className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                  >
                      {AVAILABLE_COLORS.map(color => (
                          <option key={color} value={color}>{color.replace('text-', '')}</option>
                      ))}
                  </select>
               </div>
               <div className="space-y-1">
                  <label className="text-xs text-slate-500 block">Fee (%)</label>
                  <input
                      type="number"
                      name="fee"
                      value={newSub.fee}
                      onChange={handleInputChange}
                      min="0"
                      step="0.1"
                      className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
               </div>
           </div>
           <div className="sm:col-span-6 flex gap-1 justify-end mt-2">
              <button
                type="button"
                onClick={handleAdd}
                disabled={!newSub.label}
                className={`flex-1 flex items-center justify-center gap-1 rounded px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed ${editingIndex !== null ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}
              >
                {editingIndex !== null ? <Icons.Check className="h-3 w-3" /> : <Icons.Plus className="h-3 w-3" />}
                {editingIndex !== null ? 'Update' : 'Add'}
              </button>
              {editingIndex !== null && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex items-center justify-center rounded bg-slate-200 dark:bg-slate-700 px-2 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    <Icons.X className="h-3 w-3" />
                  </button>
              )}
           </div>
        </div>
    </div>
  );
};
