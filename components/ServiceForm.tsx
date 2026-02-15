import React, { useState } from 'react';
import { ServiceFormData, ServiceItem, Category } from '../types';
import { generateServiceDescription } from '../services/geminiService';
import { Sparkles, Loader2 } from 'lucide-react';

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
    description: initialData?.description || '',
    price: initialData?.price || 0,
    currency: 'TND', // Force TND
    conditions: initialData?.conditions || '',
    requiredInfo: initialData?.requiredInfo || '',
    active: initialData?.active ?? true,
    popularity: initialData?.popularity || 0,
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
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
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Service Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g., Ultra Fast VDS"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-400">Description</label>
          <button
            type="button"
            onClick={handleGenerateDescription}
            disabled={isGenerating || !formData.name}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors"
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
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Detailed service overview..."
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Currency</label>
          <div className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-400">
             TND (Tunisian Dinar)
          </div>
        </div>
         <div className="flex items-center justify-start pt-6">
           <label className="flex items-center gap-3 cursor-pointer">
             <div className="relative">
               <input type="checkbox" className="sr-only" checked={formData.active} onChange={handleToggleActive} />
               <div className={`block h-8 w-14 rounded-full transition-colors ${formData.active ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
               <div className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition-transform ${formData.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
             </div>
             <span className="text-sm font-medium text-white">{formData.active ? 'Active' : 'Inactive'}</span>
           </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Conditions</label>
          <textarea
            name="conditions"
            value={formData.conditions}
            onChange={handleInputChange}
            rows={2}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g. No refunds, 30 days validity"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Required Info</label>
          <textarea
            name="requiredInfo"
            value={formData.requiredInfo}
            onChange={handleInputChange}
            rows={2}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g. Username, Email, ID"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
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