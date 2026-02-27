import React, { useState, useMemo } from 'react';
import { ServiceFormData, ServiceItem, Category, Subcategory } from '../types';
import { generateServiceDescription } from '../services/geminiService';
import { Sparkles, Loader2, Tag, Percent } from 'lucide-react';

interface ServiceFormProps {
  initialData?: ServiceItem;
  categories: Category[]; // Added prop
  onSubmit: (data: ServiceFormData) => void;
  onCancel: () => void;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({ initialData, categories, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<ServiceFormData>({
    name: initialData?.name || '',
    category: initialData?.category || (categories[0]?.id || ''),
    subcategory: initialData?.subcategory || '',
    second_subcategory_id: initialData?.second_subcategory_id || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    promoPrice: initialData?.promoPrice ?? '',
    badgeLabel: initialData?.badgeLabel || '',
    currency: 'TND', // Force TND
    conditions: initialData?.conditions || '',
    requiredInfo: initialData?.requiredInfo || '',
    active: initialData?.active ?? true,
    popularity: initialData?.popularity || 0,
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // Helper to organize subcategories into a hierarchy
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
        // Level 1 selected
        setFormData(prev => ({ ...prev, subcategory: selected.id, second_subcategory_id: '' }));
      } else {
        // Level 2 selected
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

  const handleToggleActive = () => {
    setFormData(prev => ({ ...prev, active: !prev.active }));
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) return;
    setIsGenerating(true);
    try {
      // Use the current description field as "notes" if not empty, otherwise just name/category
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
    // Convert empty strings to null for optional foreign keys and handle promoPrice
    const submissionData = {
      ...formData,
      subcategory: formData.subcategory || null,
      second_subcategory_id: formData.second_subcategory_id || null,
      promoPrice: formData.promoPrice === '' ? null : Number(formData.promoPrice),
    };
    onSubmit(submissionData as any);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Service Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g., Ultra Fast VDS"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={(e) => {
                handleInputChange(e);
                setFormData(prev => ({ ...prev, subcategory: '' })); // Reset subcategory on category change
            }}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Subcategory (Optional)</label>
          <select
            name="subcategory_selection"
            value={formData.second_subcategory_id || formData.subcategory || ''}
            onChange={handleSubcategoryChange}
            disabled={!formData.category}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none disabled:opacity-50"
          >
            <option value="">None</option>
            {organizedSubcategories.map(sub => (
              <option key={sub.id} value={sub.id}>
                {/* Visual indentation using non-breaking spaces */}
                {'\u00A0'.repeat(sub.level * 4)}{sub.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Description</label>
          <button
            type="button"
            onClick={handleGenerateDescription}
            disabled={isGenerating || !formData.name}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-50 transition-colors"
          >
            {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            {isGenerating ? 'Generating...' : 'Generate with AI'}
          </button>
        </div>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          required
          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Detailed service overview..."
        />
      </div>

      {/* Pricing Section */}
      <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-200 dark:border-slate-700 space-y-4">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="h-4 w-4 text-emerald-500 dark:text-emerald-400" /> Pricing & Promotion
          </h4>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Standard Price (TND)</label>
                <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    Promo Price (Optional) <Percent className="h-3 w-3 text-rose-500 dark:text-rose-400" />
                </label>
                <input
                    type="number"
                    name="promoPrice"
                    value={formData.promoPrice ?? ''}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="Discounted amount"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 border-dashed focus:border-solid"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Badge Label</label>
                <input
                    type="text"
                    name="badgeLabel"
                    value={formData.badgeLabel || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. 50% OFF, Hot"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Conditions</label>
          <textarea
            name="conditions"
            value={formData.conditions}
            onChange={handleInputChange}
            rows={2}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g. No refunds, 30 days validity"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Required Info</label>
          <textarea
            name="requiredInfo"
            value={formData.requiredInfo}
            onChange={handleInputChange}
            rows={2}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g. Username, Email, ID"
          />
        </div>
      </div>

      <div className="flex items-center justify-start">
           <label className="flex items-center gap-3 cursor-pointer">
             <div className="relative">
               <input type="checkbox" className="sr-only" checked={formData.active} onChange={handleToggleActive} />
               <div className={`block h-8 w-14 rounded-full transition-colors ${formData.active ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
               <div className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition-transform ${formData.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
             </div>
             <span className="text-sm font-medium text-slate-900 dark:text-white">{formData.active ? 'Active' : 'Inactive'}</span>
           </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all"
        >
          Save Service
        </button>
      </div>
    </form>
  );
};