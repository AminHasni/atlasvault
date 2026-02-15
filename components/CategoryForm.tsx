import React, { useState } from 'react';
import { Category } from '../types';
import * as Icons from 'lucide-react';

interface CategoryFormProps {
  initialData?: Category;
  onSubmit: (data: Category) => void;
  onCancel: () => void;
}

const AVAILABLE_ICONS = [
  'Shield', 'Smartphone', 'Gamepad2', 'Briefcase', 'Zap', 'Globe', 'Server', 'Cloud', 'Lock', 'Wifi', 'Box', 'Layers', 'Tag', 'Star', 'Heart'
];

const AVAILABLE_COLORS = [
  'text-emerald-500', 'text-blue-500', 'text-purple-500', 'text-slate-500', 
  'text-rose-500', 'text-amber-500', 'text-indigo-500', 'text-cyan-500', 'text-pink-500'
];

export const CategoryForm: React.FC<CategoryFormProps> = ({ initialData, onSubmit, onCancel }) => {
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

  const isEditing = !!initialData;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) {
        // Auto-generate simple ID if missing and not editing
        formData.id = formData.label.toLowerCase().replace(/\s+/g, '-');
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!isEditing && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">ID (Unique Identifier)</label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. the-vault (Optional, auto-generated from label if empty)"
            />
            <p className="text-xs text-slate-500">Used for database relationships. Cannot be changed later.</p>
          </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Label (EN)</label>
          <input
            type="text"
            name="label"
            value={formData.label}
            onChange={handleInputChange}
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Label (FR)</label>
          <input
            type="text"
            name="label_fr"
            value={formData.label_fr}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Label (AR)</label>
          <input
            type="text"
            name="label_ar"
            value={formData.label_ar}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-right"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Description (EN)</label>
          <textarea
            name="desc"
            value={formData.desc}
            onChange={handleInputChange}
            rows={2}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Description (FR)</label>
          <textarea
            name="desc_fr"
            value={formData.desc_fr}
            onChange={handleInputChange}
            rows={2}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Description (AR)</label>
          <textarea
            name="desc_ar"
            value={formData.desc_ar}
            onChange={handleInputChange}
            rows={2}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-right"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
         <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Icon</label>
            <div className="grid grid-cols-5 gap-2 bg-slate-800 p-2 rounded-lg border border-slate-700 h-32 overflow-y-auto custom-scrollbar">
                {AVAILABLE_ICONS.map(iconName => {
                    const Icon = (Icons as any)[iconName];
                    return (
                        <button
                            key={iconName}
                            type="button"
                            onClick={() => setFormData({...formData, icon: iconName})}
                            className={`p-2 rounded flex items-center justify-center transition-all ${formData.icon === iconName ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                            title={iconName}
                        >
                            {Icon && <Icon className="h-5 w-5" />}
                        </button>
                    )
                })}
            </div>
         </div>

         <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Theme Color</label>
            <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_COLORS.map(colorClass => (
                    <button
                        key={colorClass}
                        type="button"
                        onClick={() => setFormData({...formData, color: colorClass})}
                        className={`h-8 rounded-md border-2 transition-all flex items-center justify-center ${colorClass.replace('text-', 'bg-').replace('500', '500/20')} ${formData.color === colorClass ? 'border-white' : 'border-transparent hover:border-slate-500'}`}
                    >
                        <div className={`h-2 w-2 rounded-full ${colorClass.replace('text-', 'bg-')}`}></div>
                    </button>
                ))}
            </div>
         </div>

         <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Display Order</label>
            <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
          Save Category
        </button>
      </div>
    </form>
  );
};