import React, { useState } from 'react';
import { Category } from '../types';
import * as Icons from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

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

  const [subcategories, setSubcategories] = useState<{id: string, label: string, label_fr: string, label_ar: string, desc?: string, desc_fr?: string, desc_ar?: string, image?: string}[]>(initialData?.subcategories || []);
  const [newSub, setNewSub] = useState({ id: '', label: '', label_fr: '', label_ar: '', desc: '', desc_fr: '', desc_ar: '', image: '' });
  const [editingSubIndex, setEditingSubIndex] = useState<number | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const isEditing = !!initialData;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewSub(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewSub(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = async () => {
    if (!newSub.label) return;
    setIsGeneratingImage(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `A high quality, modern, abstract or illustrative background image representing the category: ${newSub.label}. Minimalist, tech-oriented, suitable for a digital service marketplace. No text.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
             config: {
                imageConfig: {
                    aspectRatio: "16:9",
                }
            }
        });

        let imageUrl = '';
        if (response.candidates?.[0]?.content?.parts) {
             for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64EncodeString = part.inlineData.data;
                    imageUrl = `data:image/png;base64,${base64EncodeString}`;
                    break;
                }
             }
        }

        if (imageUrl) {
            setNewSub(prev => ({ ...prev, image: imageUrl }));
        }
    } catch (error) {
        console.error("Failed to generate image", error);
        alert("Failed to generate image. Please try again.");
    } finally {
        setIsGeneratingImage(false);
    }
  };

  const handleAddSubcategory = () => {
    if (!newSub.label) return;
    
    if (editingSubIndex !== null) {
        // Update existing
        const updatedSubs = [...subcategories];
        updatedSubs[editingSubIndex] = { ...newSub, id: newSub.id || newSub.label.toUpperCase().replace(/\s+/g, '_') };
        setSubcategories(updatedSubs);
        setEditingSubIndex(null);
    } else {
        // Add new
        const id = newSub.id || newSub.label.toUpperCase().replace(/\s+/g, '_');
        setSubcategories([...subcategories, { ...newSub, id }]);
    }
    setNewSub({ id: '', label: '', label_fr: '', label_ar: '', desc: '', desc_fr: '', desc_ar: '', image: '' });
  };

  const handleEditSubcategory = (index: number) => {
      const sub = subcategories[index];
      setNewSub({
          id: sub.id,
          label: sub.label,
          label_fr: sub.label_fr,
          label_ar: sub.label_ar,
          desc: sub.desc || '',
          desc_fr: sub.desc_fr || '',
          desc_ar: sub.desc_ar || '',
          image: sub.image || ''
      });
      setEditingSubIndex(index);
  };

  const handleCancelSubEdit = () => {
      setNewSub({ id: '', label: '', label_fr: '', label_ar: '', desc: '', desc_fr: '', desc_ar: '', image: '' });
      setEditingSubIndex(null);
  };

  const handleRemoveSubcategory = (index: number) => {
    setSubcategories(subcategories.filter((_, i) => i !== index));
    if (editingSubIndex === index) handleCancelSubEdit();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) {
        // Auto-generate simple ID if missing and not editing
        formData.id = formData.label.toLowerCase().replace(/\s+/g, '-');
    }
    onSubmit({ ...formData, subcategories });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!isEditing && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">ID (Unique Identifier)</label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. the-vault (Optional, auto-generated from label if empty)"
            />
            <p className="text-xs text-slate-500">Used for database relationships. Cannot be changed later.</p>
          </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Label (EN)</label>
          <input
            type="text"
            name="label"
            value={formData.label}
            onChange={handleInputChange}
            required
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Label (FR)</label>
          <input
            type="text"
            name="label_fr"
            value={formData.label_fr}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Label (AR)</label>
          <input
            type="text"
            name="label_ar"
            value={formData.label_ar}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-right"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Description (EN)</label>
          <textarea
            name="desc"
            value={formData.desc}
            onChange={handleInputChange}
            rows={2}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Description (FR)</label>
          <textarea
            name="desc_fr"
            value={formData.desc_fr}
            onChange={handleInputChange}
            rows={2}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Description (AR)</label>
          <textarea
            name="desc_ar"
            value={formData.desc_ar}
            onChange={handleInputChange}
            rows={2}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-right"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
         <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Icon</label>
            <div className="grid grid-cols-5 gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 h-32 overflow-y-auto custom-scrollbar">
                {AVAILABLE_ICONS.map(iconName => {
                    const Icon = (Icons as any)[iconName];
                    return (
                        <button
                            key={iconName}
                            type="button"
                            onClick={() => setFormData({...formData, icon: iconName})}
                            className={`p-2 rounded flex items-center justify-center transition-all ${formData.icon === iconName ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'}`}
                            title={iconName}
                        >
                            {Icon && <Icon className="h-5 w-5" />}
                        </button>
                    )
                })}
            </div>
         </div>

         <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Theme Color</label>
            <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_COLORS.map(colorClass => (
                    <button
                        key={colorClass}
                        type="button"
                        onClick={() => setFormData({...formData, color: colorClass})}
                        className={`h-8 rounded-md border-2 transition-all flex items-center justify-center ${colorClass.replace('text-', 'bg-').replace('500', '500/20')} ${formData.color === colorClass ? 'border-slate-900 dark:border-white' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-500'}`}
                    >
                        <div className={`h-2 w-2 rounded-full ${colorClass.replace('text-', 'bg-')}`}></div>
                    </button>
                ))}
            </div>
         </div>

         <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Display Order</label>
            <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
         </div>
      </div>

      <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
        <h3 className="text-sm font-medium text-slate-900 dark:text-white">Subcategories</h3>
        
        {/* List */}
        <div className="space-y-2">
          {subcategories.map((sub, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 w-full mr-4">
                 {sub.image ? (
                     <img src={sub.image} alt={sub.label} className="h-10 w-16 object-cover rounded" />
                 ) : (
                     <div className="h-10 w-16 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center text-xs text-slate-400">No Img</div>
                 )}
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs w-full">
                     <div><span className="text-slate-500 block">ID</span>{sub.id}</div>
                     <div><span className="text-slate-500 block">EN</span>{sub.label}</div>
                     <div><span className="text-slate-500 block">FR</span>{sub.label_fr}</div>
                     <div><span className="text-slate-500 block">AR</span>{sub.label_ar}</div>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditSubcategory(idx)}
                    className="text-indigo-500 hover:text-indigo-600 p-1"
                  >
                    <Icons.Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubcategory(idx)}
                    className="text-rose-500 hover:text-rose-600 p-1"
                  >
                    <Icons.Trash2 className="h-4 w-4" />
                  </button>
              </div>
            </div>
          ))}
          {subcategories.length === 0 && (
            <p className="text-xs text-slate-500 italic">No subcategories added yet.</p>
          )}
        </div>

        {/* Add Form */}
        <div className={`grid grid-cols-1 sm:grid-cols-6 gap-2 items-end p-3 rounded-lg border transition-colors ${editingSubIndex !== null ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
           <div className="sm:col-span-1">
              <label className="text-xs text-slate-500 mb-1 block">ID (Auto)</label>
              <input 
                type="text" 
                name="id" 
                value={newSub.id} 
                onChange={handleSubInputChange}
                placeholder="Auto"
                className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs text-slate-900 dark:text-white"
              />
           </div>
           <div className="sm:col-span-1">
              <label className="text-xs text-slate-500 mb-1 block">Label (EN)</label>
              <input 
                type="text" 
                name="label" 
                value={newSub.label} 
                onChange={handleSubInputChange}
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
                onChange={handleSubInputChange}
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
                onChange={handleSubInputChange}
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
                onChange={handleSubInputChange}
                rows={2}
                className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs text-slate-900 dark:text-white"
              />
           </div>
           <div className="sm:col-span-2">
              <label className="text-xs text-slate-500 mb-1 block">Description (FR)</label>
              <textarea 
                name="desc_fr" 
                value={newSub.desc_fr} 
                onChange={handleSubInputChange}
                rows={2}
                className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs text-slate-900 dark:text-white"
              />
           </div>
           <div className="sm:col-span-2">
              <label className="text-xs text-slate-500 mb-1 block">Description (AR)</label>
              <textarea 
                name="desc_ar" 
                value={newSub.desc_ar} 
                onChange={handleSubInputChange}
                rows={2}
                className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs text-slate-900 dark:text-white text-right"
              />
           </div>

           <div className="sm:col-span-6">
               <label className="text-xs text-slate-500 mb-1 block">Image</label>
               <div className="flex gap-2 items-center">
                   {newSub.image ? (
                       <div className="relative w-24 h-16 group shrink-0">
                           <img src={newSub.image} alt="Preview" className="w-full h-full object-cover rounded border border-slate-300 dark:border-slate-600" />
                           <button 
                                type="button" 
                                onClick={() => setNewSub(prev => ({...prev, image: ''}))}
                                className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                               <Icons.X className="h-3 w-3" />
                           </button>
                       </div>
                   ) : (
                       <div className="flex gap-2 w-full">
                           <label className="flex-1 h-8 flex items-center justify-center gap-1 rounded border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                               <Icons.Upload className="h-3 w-3" />
                               Upload
                               <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                           </label>
                           <button
                                type="button"
                                onClick={handleGenerateImage}
                                disabled={!newSub.label || isGeneratingImage}
                                className="flex-1 h-8 flex items-center justify-center gap-1 rounded border border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] hover:bg-indigo-100 dark:hover:bg-indigo-900/40 disabled:opacity-50"
                           >
                               {isGeneratingImage ? <Icons.Loader2 className="h-3 w-3 animate-spin" /> : <Icons.Sparkles className="h-3 w-3" />}
                               {isGeneratingImage ? 'Gen...' : 'AI Gen'}
                           </button>
                       </div>
                   )}
               </div>
           </div>
           <div className="sm:col-span-6 flex gap-1 justify-end mt-2">
              <button
                type="button"
                onClick={handleAddSubcategory}
                disabled={!newSub.label}
                className={`flex-1 flex items-center justify-center gap-1 rounded px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed ${editingSubIndex !== null ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}
              >
                {editingSubIndex !== null ? <Icons.Check className="h-3 w-3" /> : <Icons.Plus className="h-3 w-3" />}
                {editingSubIndex !== null ? 'Update' : 'Add'}
              </button>
              {editingSubIndex !== null && (
                  <button
                    type="button"
                    onClick={handleCancelSubEdit}
                    className="flex items-center justify-center rounded bg-slate-200 dark:bg-slate-700 px-2 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    <Icons.X className="h-3 w-3" />
                  </button>
              )}
           </div>
        </div>
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
          Save Category
        </button>
      </div>
    </form>
  );
};