import React, { useState, useEffect, useMemo } from 'react';
import { Subcategory, Category } from '../types';
import * as Icons from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface SubcategoryFormProps {
  initialData?: Subcategory;
  categories: Category[];
  onSubmit: (data: Subcategory) => void;
  onCancel: () => void;
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

export const SubcategoryForm: React.FC<SubcategoryFormProps> = ({ initialData, categories, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Subcategory>({
    id: initialData?.id || '',
    category_id: initialData?.category_id || (categories.length > 0 ? categories[0].id : ''),
    parent_id: initialData?.parent_id || undefined,
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
  const isEditing = !!initialData;

  // Helper to organize subcategories into a hierarchy for the parent dropdown
  const organizedSubcategories = useMemo(() => {
    const selectedCategory = categories.find(c => c.id === formData.category_id);
    if (!selectedCategory || !selectedCategory.subcategories) return [];

    const allSubs = selectedCategory.subcategories.filter(s => s.id !== formData.id); // Exclude self
    const roots = allSubs.filter(s => !s.parent_id);
    const children = allSubs.filter(s => s.parent_id);
    
    const tree: (Subcategory & { level: number })[] = [];
    
    for (const root of roots) {
      tree.push({ ...root, level: 0 });
      const rootChildren = children.filter(c => c.parent_id === root.id);
      for (const child of rootChildren) {
         tree.push({ ...child, level: 1 });
         const grandChildren = children.filter(gc => gc.parent_id === child.id);
         for (const grandChild of grandChildren) {
            tree.push({ ...grandChild, level: 2 });
         }
      }
    }
    return tree;
  }, [categories, formData.category_id, formData.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fee' || name === 'order' ? parseFloat(value) || 0 : (name === 'parent_id' && value === '' ? undefined : value)
    }));
  };

  const handleTranslate = async () => {
      if (!formData.label && !formData.desc) return;
      setIsTranslating(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const prompt = `Translate the following subcategory label and description into French and Arabic.
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
          setIsTranslating(false);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category_id) {
        alert('Please select a parent category.');
        return;
    }

    // Generate ID if empty
    const dataToSubmit = {
        ...formData,
        id: formData.id || `SUB_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    };
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Basic Info</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Parent Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={(e) => {
                    handleInputChange(e);
                    // Reset parent_id when category changes
                    setFormData(prev => ({ ...prev, parent_id: undefined }));
                }}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                required
              >
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Parent Subcategory (Optional)</label>
              <select
                name="parent_id"
                value={formData.parent_id || ''}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">None (Top Level)</option>
                {organizedSubcategories.map(sub => (
                    <option key={sub.id} value={sub.id}>
                        {'\u00A0'.repeat(sub.level * 4)}{sub.label}
                    </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ID (Auto-generated if empty)</label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleInputChange}
                disabled={isEditing}
                placeholder="e.g. SUB_CAT_1"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Label (English)</label>
                  <button
                      type="button"
                      onClick={handleTranslate}
                      disabled={isTranslating || (!formData.label && !formData.desc)}
                      className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                  >
                      {isTranslating ? <Icons.Loader2 className="h-3 w-3 animate-spin" /> : <Icons.Languages className="h-3 w-3" />}
                      Auto Translate
                  </button>
              </div>
              <input
                type="text"
                name="label"
                value={formData.label}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Label (French)</label>
                    <input
                        type="text"
                        name="label_fr"
                        value={formData.label_fr}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Label (Arabic)</label>
                    <input
                        type="text"
                        name="label_ar"
                        value={formData.label_ar}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-right"
                    />
                </div>
            </div>
        </div>

        {/* Appearance & Details */}
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Appearance & Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Icon</label>
                  <div className="relative">
                    <select
                        name="icon"
                        value={formData.icon}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 pl-10 pr-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 appearance-none"
                    >
                        {AVAILABLE_ICONS.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                        ))}
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        {(() => {
                            const Icon = (Icons as any)[formData.icon || 'Box'] || Icons.Box;
                            return <Icon className="h-4 w-4" />;
                        })()}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Color</label>
                  <select
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 ${formData.color}`}
                  >
                    {AVAILABLE_COLORS.map(color => (
                      <option key={color} value={color} className={color}>{color.replace('text-', '')}</option>
                    ))}
                  </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fee (%)</label>
                    <input
                        type="number"
                        name="fee"
                        value={formData.fee}
                        onChange={handleInputChange}
                        min="0"
                        step="0.1"
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Order</label>
                    <input
                        type="number"
                        name="order"
                        value={formData.order}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (English)</label>
              <textarea
                name="desc"
                value={formData.desc}
                onChange={handleInputChange}
                rows={2}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          {isEditing ? 'Update Subcategory' : 'Create Subcategory'}
        </button>
      </div>
    </form>
  );
};
